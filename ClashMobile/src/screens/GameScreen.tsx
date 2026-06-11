import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  SafeAreaView, ActivityIndicator, Dimensions, Image, Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, Category, Question, GameState } from '../types';
import { questionsAPI, gamesAPI } from '../services/api';
import { gameSocket } from '../services/gameSocket';
import { storage } from '../utils/storage';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, GAME_LOGO, POWERUPS, getCategoryImageUri } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Game'>;
type Route = RouteProp<RootStackParamList, 'Game'>;
const { width, height } = Dimensions.get('window');
const POINT_TIERS = [200, 400, 600];

export default function GameScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { config, categories } = route.params;

  const [gameState, setGameState] = useState<GameState>({
    team1: { score: 0, powerUps: config.team1Powerups.reduce((a, id) => ({ ...a, [id]: true }), {}) },
    team2: { score: 0, powerUps: config.team2Powerups.reduce((a, id) => ({ ...a, [id]: true }), {}) },
    currentTurn: 1,
    answeredQuestions: [],
    doublePoints: false,
    blockedTeam: null,
  });

  const [sessionQ, setSessionQ] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [backendId, setBackendId] = useState<number | null>(null);

  const [activeQ, setActiveQ] = useState<{ q: Question; ci: number; si: number; team: 1 | 2; pts: number } | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [paused, setPaused] = useState(false);
  const [cfTime, setCfTime] = useState(30);
  const [cfOn, setCfOn] = useState(false);
  const [puMsg, setPuMsg] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const timerRef = useRef<any>(null);
  const cfRef = useRef<any>(null);

  const map = (q: any): Question => ({
    id: String(q.id),
    category_id: String(q.category_id),
    question: { ar: q.question_ar || '', en: q.question_en || '' },
    answer: { ar: q.answer_ar || '', en: q.answer_en || '' },
    points: Number(q.points),
    difficulty: q.difficulty,
    image: q.question_image || q.image_url || '',
    answerImage: q.answer_image || q.answer_image_url || '',
  });

  const shuffle = <T,>(a: T[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  };

  useEffect(() => {
    (async () => {
      const init: Record<string, Question[]> = {};
      for (let ci = 0; ci < categories.length; ci++) {
        try {
          const res = await questionsAPI.getByCategory(categories[ci].id as number);
          const all = ((res as any)?.data ?? []).map(map);
          const by: Record<number, Question[]> = { 200: [], 400: [], 600: [] };
          for (const q of all) { const p = Number(q.points); by[p <= 200 ? 200 : p <= 400 ? 400 : 600].push(q); }
          const slots: Question[] = [];
          for (let si = 0; si < 6; si++) {
            const tier = POINT_TIERS[Math.floor(si / 2)];
            const pool = shuffle(by[tier]);
            slots[si] = pool[si % 2 % pool.length] ?? ({ id: `ph-${ci}-${si}`, question: { ar: '—', en: '—' }, answer: { ar: '—', en: '—' }, points: tier, difficulty: 'easy' } as Question);
          }
          init[String(ci)] = slots;
        } catch {
          init[String(ci)] = Array(6).fill({ id: `err-${ci}`, question: { ar: '—', en: '—' }, answer: { ar: '—', en: '—' }, points: 200, difficulty: 'easy' } as Question);
        }
      }
      setSessionQ(init);
      try {
        const gr = await gamesAPI.create({ sessionName: config.sessionName, team1Name: config.team1Name, team2Name: config.team2Name });
        const gid = (gr as any)?.data?.id;
        if (gid) { setBackendId(gid); await storage.setItem('currentGameId', String(gid)); gameSocket.connect(gid); }
      } catch {}
      setLoading(false);
    })();
    return () => { clearT(); gameSocket.disconnect(); };
  }, []);

  const clearT = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const startT = (secs: number) => {
    clearT(); setTimeLeft(secs);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => { if (p <= 1) { clearT(); return 0; } return p - 1; });
    }, 1000);
  };

  const openQ = (ci: number, si: number) => {
    const key = `${ci}-${si}`;
    if (gameState.answeredQuestions.includes(key)) return;
    const q = sessionQ[String(ci)]?.[si];
    if (!q) return;
    const tier = POINT_TIERS[Math.floor(si / 2)];
    const pts = gameState.doublePoints ? tier * 2 : tier;
    setActiveQ({ q, ci, si, team: gameState.currentTurn, pts });
    setShowAns(false);
    setPaused(false);
    setCfOn(false);
    setCfTime(30);
    startT(gameState.currentTurn === 1 ? config.team1Time : config.team2Time);
  };

  const closeQ = () => {
    clearT();
    if (cfRef.current) { clearInterval(cfRef.current); cfRef.current = null; }
    setActiveQ(null);
    setShowAns(false);
    setPaused(false);
    setCfOn(false);
  };

  const correct = async () => {
    if (!activeQ) return;
    clearT();
    const key = `${activeQ.ci}-${activeQ.si}`;
    setGameState((prev) => {
      const ns = {
        ...prev,
        team1: activeQ.team === 1 ? { ...prev.team1, score: prev.team1.score + activeQ.pts } : prev.team1,
        team2: activeQ.team === 2 ? { ...prev.team2, score: prev.team2.score + activeQ.pts } : prev.team2,
        answeredQuestions: [...prev.answeredQuestions, key],
        currentTurn: (3 - activeQ.team) as 1 | 2,
        doublePoints: false,
        blockedTeam: null,
      };
      if (backendId) gamesAPI.updateScores(backendId, { team1Score: ns.team1.score, team2Score: ns.team2.score }).catch(() => {});
      return ns;
    });
    if (backendId) { gamesAPI.recordQuestion(backendId, { questionId: Number(activeQ.q.id), askedByTeam: activeQ.team, answeredByTeam: activeQ.team, isCorrect: true, pointsEarned: activeQ.pts }).catch(() => {}); }
    closeQ();
  };

  const wrong = () => {
    if (!activeQ) return;
    clearT();
    const key = `${activeQ.ci}-${activeQ.si}`;
    setGameState((prev) => ({ ...prev, answeredQuestions: [...prev.answeredQuestions, key], currentTurn: (3 - activeQ.team) as 1 | 2, doublePoints: false, blockedTeam: null }));
    if (backendId) { gamesAPI.recordQuestion(backendId, { questionId: Number(activeQ.q.id), askedByTeam: activeQ.team, isCorrect: false, pointsEarned: 0 }).catch(() => {}); }
    closeQ();
  };

  const endGame = async () => {
    const { team1, team2 } = gameState;
    const winner = team1.score > team2.score ? config.team1Name : team2.score > team1.score ? config.team2Name : 'draw';
    if (backendId) { gamesAPI.end(backendId, winner).catch(() => {}); }
    await storage.removeItem('currentGameId');
    await storage.removeItem('savedGame');
    navigation.navigate('Result', { winner, team1Score: team1.score, team2Score: team2.score, config });
  };

  const activatePu = (id: string) => {
    const team = gameState.currentTurn;
    const teamState = team === 1 ? gameState.team1 : gameState.team2;
    if (!teamState.powerUps[id]) return;
    const upd = team === 1
      ? (p: GameState) => ({ ...p, team1: { ...p.team1, powerUps: { ...p.team1.powerUps, [id]: false } } })
      : (p: GameState) => ({ ...p, team2: { ...p.team2, powerUps: { ...p.team2.powerUps, [id]: false } } });
    setGameState(upd);
    if (id === 'double') { setGameState((p) => ({ ...p, doublePoints: true })); flash(ar ? '⚡ نقاط مضاعفة!' : '⚡ Double Points!'); }
    else if (id === 'block') { setGameState((p) => ({ ...p, blockedTeam: 3 - team })); flash(ar ? '🛡️ تم حجب الخصم!' : '🛡️ Opponent blocked!'); }
    else if (id === 'callfriend' && activeQ) { setCfOn(true); setCfTime(30); cfRef.current = setInterval(() => setCfTime((t) => { if (t <= 1) { clearInterval(cfRef.current); return 0; } return t - 1; }), 1000); flash(ar ? '📞 30 ثانية للتشاور!' : '📞 30 seconds to consult!'); }
    else if (id === 'twoanswers') { flash(ar ? '🎯 لديك إجابتان!' : '🎯 You have two answers!'); }
    else if (id === 'steal') { setGameState((p) => ({ ...p, team1: team === 1 ? { ...p.team1, score: p.team1.score + 200 } : { ...p.team1, score: Math.max(0, p.team1.score - 200) }, team2: team === 2 ? { ...p.team2, score: p.team2.score + 200 } : { ...p.team2, score: Math.max(0, p.team2.score - 200) } })); flash(ar ? '💸 سرقت 200 نقطة!' : '💸 Stole 200 points!'); }
  };

  const flash = (msg: string) => { setPuMsg(msg); setTimeout(() => setPuMsg(null), 3000); };

  const qText = (q: Question) => typeof q.question === 'object' ? (q.question as any)[language] || (q.question as any).ar : '';
  const aText = (q: Question) => typeof q.answer === 'object' ? (q.answer as any)[language] || (q.answer as any).ar : String(q.answer || '');
  const catName = (c: Category) => typeof c.name === 'object' ? (c.name as any)[language] || (c.name as any).ar : String(c.name);
  const isAns = (ci: number, si: number) => gameState.answeredQuestions.includes(`${ci}-${si}`);

  if (loading) return (
    <SafeAreaView style={s.container}>
      <Image source={{ uri: GAME_LOGO }} style={{ width: 180, height: 110, alignSelf: 'center', marginTop: 80 }} resizeMode="contain" />
      <ActivityIndicator color={COLORS.BROWN_BEIGE} size="large" style={{ marginTop: 20 }} />
      <Text style={{ color: COLORS.BROWN_BEIGE, textAlign: 'center', marginTop: 10 }}>{ar ? 'جاري التحميل...' : 'Loading...'}</Text>
    </SafeAreaView>
  );

  const t1 = gameState.team1, t2 = gameState.team2;

  return (
    <SafeAreaView style={s.container}>
      {/* Scoreboard */}
      <View style={s.scoreboard}>
        <View style={[s.teamScoreBox, gameState.currentTurn === 1 && s.activeTeamBox]}>
          <Text style={s.teamScoreName} numberOfLines={1}>{config.team1Name}</Text>
          <Text style={s.teamScoreNum}>{t1.score}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowExit(true)}>
          <Image source={{ uri: GAME_LOGO }} style={s.midLogo} resizeMode="contain" />
        </TouchableOpacity>
        <View style={[s.teamScoreBox, s.teamScoreBoxRight, gameState.currentTurn === 2 && s.activeTeamBox]}>
          <Text style={s.teamScoreName} numberOfLines={1}>{config.team2Name}</Text>
          <Text style={s.teamScoreNum}>{t2.score}</Text>
        </View>
      </View>

      {/* Turn + powerup msg */}
      <View style={s.turnBar}>
        <Text style={s.turnText}>
          🎯 {gameState.currentTurn === 1 ? config.team1Name : config.team2Name} {ar ? '— دورك' : '— Your Turn'}
        </Text>
        {gameState.doublePoints && <Text style={s.doubleTag}>⚡ {ar ? 'نقاط مضاعفة' : 'Double Points'}</Text>}
      </View>
      {puMsg && <View style={s.puMsgBar}><Text style={s.puMsgText}>{puMsg}</Text></View>}

      {/* Active powerups */}
      <View style={s.puRow}>
        {Object.entries(gameState.currentTurn === 1 ? t1.powerUps : t2.powerUps).map(([id, avail]) =>
          avail && POWERUPS[id] ? (
            <TouchableOpacity key={id} style={s.puChip} onPress={() => activatePu(id)}>
              <Image source={{ uri: POWERUPS[id].icon_url }} style={s.puChipImg} />
            </TouchableOpacity>
          ) : null
        )}
      </View>

      {/* Game Board */}
      <ScrollView style={s.boardWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Category headers */}
            <View style={s.headRow}>
              {categories.map((cat, ci) => {
                const imgUri = getCategoryImageUri(cat.image as string);
                return (
                  <View key={String(cat.id)} style={s.catHeader}>
                    {imgUri
                      ? <Image source={{ uri: imgUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      : <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.BROWN_DARK2 }]} />
                    }
                    <View style={s.catHeaderOverlay} />
                    <Text style={s.catHeaderText} numberOfLines={2}>{catName(cat)}</Text>
                  </View>
                );
              })}
            </View>
            {/* Rows: 0=200a, 1=200b, 2=400a, 3=400b, 4=600a, 5=600b */}
            {[0,1,2,3,4,5].map((si) => (
              <View key={si} style={s.boardRow}>
                {categories.map((_, ci) => {
                  const tier = POINT_TIERS[Math.floor(si / 2)];
                  const answered = isAns(ci, si);
                  const isT1slot = si % 2 === 0;
                  return (
                    <TouchableOpacity
                      key={`${ci}-${si}`}
                      style={[s.cell, answered && s.cellDone, isT1slot ? s.cellT1 : s.cellT2]}
                      onPress={() => !answered && openQ(ci, si)}
                      activeOpacity={answered ? 1 : 0.75}
                    >
                      {answered
                        ? <Text style={s.cellDoneText}>✓</Text>
                        : <Text style={[s.cellPts, isT1slot ? s.cellPtsT1 : s.cellPtsT2]}>{tier}</Text>
                      }
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <TouchableOpacity style={s.endBtn} onPress={() => setShowEnd(true)}>
        <Text style={s.endBtnText}>{ar ? '🏁 إنهاء اللعبة' : '🏁 End Game'}</Text>
      </TouchableOpacity>

      {/* ── Question Modal ── */}
      <Modal visible={!!activeQ} animationType="slide" presentationStyle="pageSheet">
        {activeQ && (
          <View style={qm.container}>
            <View style={qm.topBar}>
              <View>
                <Text style={qm.teamLabel}>{activeQ.team === 1 ? config.team1Name : config.team2Name}</Text>
                <Text style={qm.ptsLabel}>{activeQ.pts} {ar ? 'نقطة' : 'pts'}</Text>
              </View>
              <View style={qm.timerBox}>
                <Text style={[qm.timer, timeLeft <= 10 && qm.timerRed]}>{timeLeft}</Text>
                <Text style={qm.timerLabel}>{ar ? 'ث' : 's'}</Text>
              </View>
              <View style={qm.topRight}>
                <TouchableOpacity style={qm.pauseBtn} onPress={() => {
                  if (!paused) { clearT(); } else {
                    timerRef.current = setInterval(() => setTimeLeft((p) => { if (p <= 1) { clearT(); return 0; } return p - 1; }), 1000);
                  }
                  setPaused(!paused);
                }}>
                  <Text style={qm.pauseText}>{paused ? '▶' : '⏸'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {cfOn && (
              <View style={qm.cfBanner}>
                <Text style={qm.cfText}>📞 {ar ? 'وقت التشاور' : 'Consult time'}: {cfTime}s</Text>
              </View>
            )}

            <ScrollView style={{ flex: 1 }} contentContainerStyle={qm.body}>
              <Text style={qm.catLabel}>{catName(categories[activeQ.ci])}</Text>

              {activeQ.q.image ? (
                <Image source={{ uri: activeQ.q.image.startsWith('http') ? activeQ.q.image : `https://clashofminds-production.up.railway.app${activeQ.q.image}` }}
                  style={qm.qImg} resizeMode="contain" />
              ) : null}

              <Text style={qm.qText}>{qText(activeQ.q)}</Text>

              {showAns ? (
                <View style={qm.ansBox}>
                  <Text style={qm.ansLabel}>{ar ? 'الإجابة:' : 'Answer:'}</Text>
                  {activeQ.q.answerImage ? (
                    <Image source={{ uri: activeQ.q.answerImage.startsWith('http') ? activeQ.q.answerImage : `https://clashofminds-production.up.railway.app${activeQ.q.answerImage}` }}
                      style={qm.qImg} resizeMode="contain" />
                  ) : null}
                  <Text style={qm.ansText}>{aText(activeQ.q)}</Text>
                </View>
              ) : (
                <TouchableOpacity style={qm.showAnsBtn} onPress={() => setShowAns(true)}>
                  <Text style={qm.showAnsBtnText}>{ar ? '👁 عرض الإجابة' : '👁 Show Answer'}</Text>
                </TouchableOpacity>
              )}

              {/* In-question powerups */}
              <View style={qm.puSection}>
                <Text style={qm.puSectionLabel}>{ar ? 'وسائل المساعدة:' : 'Power-Ups:'}</Text>
                <View style={qm.puSectionRow}>
                  {(['callfriend','twoanswers'] as const).map((id) => {
                    const avail = (gameState.currentTurn === 1 ? t1 : t2).powerUps[id];
                    if (!avail || !POWERUPS[id]) return null;
                    return (
                      <TouchableOpacity key={id} style={qm.puInlineBtn} onPress={() => activatePu(id)}>
                        <Image source={{ uri: POWERUPS[id].icon_url }} style={{ width: 28, height: 28 }} />
                        <Text style={qm.puInlineText}>{POWERUPS[id].name[language as 'ar'|'en']}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={qm.actions}>
              <TouchableOpacity style={qm.wrongBtn} onPress={wrong}>
                <Text style={qm.wrongText}>✗ {ar ? 'خطأ' : 'Wrong'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={qm.correctBtn} onPress={correct}>
                <Text style={qm.correctText}>✓ {ar ? 'صحيح' : 'Correct'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Exit confirm */}
      <Modal visible={showExit} transparent animationType="fade">
        <View style={cm.overlay}>
          <View style={cm.card}>
            <Text style={cm.title}>{ar ? 'الخروج؟' : 'Exit?'}</Text>
            <View style={cm.btns}>
              <TouchableOpacity style={cm.cancel} onPress={() => setShowExit(false)}><Text style={cm.cancelText}>{ar ? 'إلغاء' : 'Cancel'}</Text></TouchableOpacity>
              <TouchableOpacity style={cm.confirm} onPress={() => navigation.navigate('Landing')}><Text style={cm.confirmText}>{ar ? 'خروج' : 'Exit'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End confirm */}
      <Modal visible={showEnd} transparent animationType="fade">
        <View style={cm.overlay}>
          <View style={cm.card}>
            <Text style={cm.title}>{ar ? 'إنهاء اللعبة؟' : 'End Game?'}</Text>
            <Text style={cm.body2}>{`${config.team1Name}: ${t1.score}\n${config.team2Name}: ${t2.score}`}</Text>
            <View style={cm.btns}>
              <TouchableOpacity style={cm.cancel} onPress={() => setShowEnd(false)}><Text style={cm.cancelText}>{ar ? 'إلغاء' : 'Cancel'}</Text></TouchableOpacity>
              <TouchableOpacity style={cm.confirm} onPress={() => { setShowEnd(false); endGame(); }}><Text style={cm.confirmText}>{ar ? 'إنهاء' : 'End'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CELL_W = Math.max(72, (width - 16) / 6);
const CAT_H = CELL_W * 1.2;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_GAME },
  scoreboard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.BROWN_MED, paddingHorizontal: 8, paddingVertical: 8 },
  teamScoreBox: { flex: 1, alignItems: 'flex-start', padding: 8, borderRadius: 12 },
  teamScoreBoxRight: { alignItems: 'flex-end' },
  activeTeamBox: { backgroundColor: COLORS.BROWN_BEIGE },
  teamScoreName: { color: '#fff', fontSize: 11, fontWeight: '700' },
  teamScoreNum: { color: COLORS.BROWN_BEIGE, fontSize: 28, fontWeight: '900' },
  midLogo: { width: 60, height: 36 },
  turnBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.BROWN_DARK2, paddingVertical: 6, gap: 8 },
  turnText: { color: COLORS.BROWN_BEIGE, fontWeight: '700', fontSize: 13 },
  doubleTag: { color: '#fcd34d', fontSize: 12, fontWeight: '700' },
  puMsgBar: { backgroundColor: 'rgba(196,168,130,0.2)', paddingVertical: 6, alignItems: 'center' },
  puMsgText: { color: COLORS.BROWN_BEIGE, fontWeight: '700' },
  puRow: { flexDirection: 'row', padding: 8, gap: 8, justifyContent: 'flex-end', backgroundColor: COLORS.BG_GAME },
  puChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  puChipImg: { width: 32, height: 32 },
  boardWrap: { flex: 1 },
  headRow: { flexDirection: 'row' },
  catHeader: { width: CELL_W, height: CAT_H, margin: 2, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  catHeaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  catHeaderText: { color: '#fff', fontSize: 10, fontWeight: '800', textAlign: 'center', padding: 4, zIndex: 1 },
  boardRow: { flexDirection: 'row' },
  cell: { width: CELL_W, height: 54, margin: 2, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  cellT1: { backgroundColor: COLORS.BROWN_DARK2 },
  cellT2: { backgroundColor: '#3D1A5A' },
  cellDone: { backgroundColor: 'rgba(0,0,0,0.08)', shadowOpacity: 0 },
  cellDoneText: { color: 'rgba(0,0,0,0.2)', fontSize: 18 },
  cellPts: { fontSize: 17, fontWeight: '900' },
  cellPtsT1: { color: COLORS.BROWN_BEIGE },
  cellPtsT2: { color: '#d8b4fe' },
  endBtn: { backgroundColor: COLORS.BROWN_MED, padding: 12, alignItems: 'center' },
  endBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 14 },
});

const qm = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_GAME },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.BROWN_DARK2 },
  teamLabel: { color: COLORS.BROWN_BEIGE, fontWeight: '800', fontSize: 14 },
  ptsLabel: { color: 'rgba(196,168,130,0.6)', fontSize: 12 },
  timerBox: { alignItems: 'center' },
  timer: { color: '#4ade80', fontSize: 36, fontWeight: '900' },
  timerRed: { color: '#f87171' },
  timerLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  topRight: { flexDirection: 'row', gap: 8 },
  pauseBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  pauseText: { color: '#fff', fontSize: 16 },
  cfBanner: { backgroundColor: 'rgba(22,163,74,0.2)', padding: 10, alignItems: 'center' },
  cfText: { color: '#4ade80', fontWeight: '700' },
  body: { padding: 20, paddingBottom: 40 },
  catLabel: { color: COLORS.TEXT_MUTED, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  qImg: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  qText: { color: COLORS.TEXT_DARK, fontSize: 20, fontWeight: '700', lineHeight: 30, textAlign: 'center', marginBottom: 24 },
  showAnsBtn: { backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 14, padding: 16, alignItems: 'center' },
  showAnsBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  ansBox: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#86efac' },
  ansLabel: { color: '#15803d', fontWeight: '700', marginBottom: 8 },
  ansText: { color: COLORS.TEXT_DARK, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  puSection: { marginTop: 24 },
  puSectionLabel: { color: COLORS.TEXT_MUTED, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  puSectionRow: { flexDirection: 'row', gap: 10 },
  puInlineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.BG, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: COLORS.BROWN_BEIGE },
  puInlineText: { color: COLORS.BROWN_PRIMARY, fontWeight: '700', fontSize: 12, flex: 1 },
  actions: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.BROWN_BEIGE },
  wrongBtn: { flex: 1, paddingVertical: 18, borderRadius: 14, backgroundColor: '#fee2e2', alignItems: 'center', borderWidth: 1.5, borderColor: '#fca5a5' },
  wrongText: { color: '#dc2626', fontWeight: '900', fontSize: 17 },
  correctBtn: { flex: 1, paddingVertical: 18, borderRadius: 14, backgroundColor: '#16a34a', alignItems: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  correctText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: width - 64 },
  title: { color: COLORS.BROWN_PRIMARY, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  body2: { color: COLORS.TEXT_MUTED, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  btns: { flexDirection: 'row', gap: 12 },
  cancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.BG, alignItems: 'center' },
  cancelText: { color: COLORS.BROWN_PRIMARY, fontWeight: '700' },
  confirm: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.BROWN_PRIMARY, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '900' },
});
