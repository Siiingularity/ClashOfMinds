import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import type { Category, Question } from '@/types';
import { powerUps, gameLogo } from '@/data/categories';
import { gamesAPI } from '@/services/api';
import { API_URL } from '@/config/api';
import { LogOut, Flag, Home, AlertTriangle, Pause, Play, ArrowLeft, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface GameScreenProps {
  categories: Category[];
  config: {
    sessionName: string;
    team1Name: string;
    team2Name: string;
    team1Powerups: string[];
    team2Powerups: string[];
    team1Time: number;
    team2Time: number;
  };
  onExit: () => void;
  onEnd: (winner: string, team1Score: number, team2Score: number) => void;
  savedGameState?: any;
}

interface GameState {
  team1: { score: number; powerUps: Record<string, boolean> };
  team2: { score: number; powerUps: Record<string, boolean> };
  currentTurn: 1 | 2;
  answeredQuestions: Set<string>;
  doublePoints: boolean;
  blockedTeam: number | null;
}

export function GameScreen({ categories, config, onExit, onEnd, savedGameState }: GameScreenProps) {
  const { language, dir } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(() => {
    if (savedGameState) {
      return {
        ...savedGameState,
        answeredQuestions: new Set(savedGameState.answeredQuestions)
      };
    }

    return {
      team1: {
        score: 0,
        powerUps: config.team1Powerups.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      },
      team2: {
        score: 0,
        powerUps: config.team2Powerups.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      },
      currentTurn: 1,
      answeredQuestions: new Set(),
      doublePoints: false,
      blockedTeam: null
    };
  });

  const [currentQuestion, setCurrentQuestion] = useState<{
    question: Question;
    categoryIndex: number;
    questionIndex: number;
    team: 1 | 2;
    timeElapsed: number;
    showAnswer: boolean;
    isPaused: boolean;
    showTeamPicker: boolean;
    showCallFriend?: boolean;
  } | null>(null);

  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [powerupMessage, setPowerupMessage] = useState<{ icon: string; text: string } | null>(null);
  // Call-a-friend timer state (lives in parent to avoid nested component reset)
  const [cfStarted, setCfStarted] = useState(false);
  const [cfSeconds, setCfSeconds] = useState(30);
  const [cfDone, setCfDone] = useState(false);
  const [backendGameId, setBackendGameId] = useState<number | null>(() => {
    const saved = localStorage.getItem('currentGameId');
    return saved ? Number(saved) : null;
  });
  const [loadingQuestion] = [false];
  const [gameLoading, setGameLoading] = useState(true);

  // Fixed questions per session: Record<catIndex, Question[6]>
  const [sessionQuestions, setSessionQuestions] = useState<Record<string, Question[]>>({});
  // All questions per category+tier: Record<"catIdx_pts", Question[]>
  const [questionPools, setQuestionPools] = useState<Record<string, Question[]>>({});
  // Current index in each pool (for cycling)
  const [poolPointers, setPoolPointers] = useState<Record<string, number>>({});

  // Image lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // "ولا كلمة" countdown timer
  const [wcTimerValue, setWcTimerValue] = useState(60);
  const [wcTimerStarted, setWcTimerStarted] = useState(false);
  const [wcTimerDone, setWcTimerDone] = useState(false);
  const wcTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mapApiQuestionToUi = (q: any): Question => ({
    id: String(q.id),
    category_id: String(q.category_id),
    question: {
      ar: q.question_ar || '',
      en: q.question_en || ''
    },
    answer: {
      ar: q.answer_ar || '',
      en: q.answer_en || ''
    },
    points: Number(q.points),
    difficulty: q.difficulty,
    image: q.question_image || q.image_url || '',
    answerImage: q.answer_image || q.answer_image_url || ''
  });


  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const POINT_TIERS = [200, 400, 600];
  const SLOTS_PER_TIER = 2; // left col (team1) + right col (team2)

  const loadAllQuestions = useCallback(async () => {
    setGameLoading(true);
    const pools: Record<string, Question[]> = {};
    const pointers: Record<string, number> = {};
    const initial: Record<string, Question[]> = {};

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const category = categories[catIdx];
      try {
        const res = await fetch(`${API_URL}/api/questions/category/${category.id}`, { headers });
        const data = await res.json();
        const allQ: Question[] = (Array.isArray(data.data) ? data.data : []).map(mapApiQuestionToUi);

        // Build pools per tier
        const byTier: Record<number, Question[]> = { 200: [], 400: [], 600: [] };
        for (const q of allQ) {
          const pts = Number(q.points);
          if (pts <= 200)       byTier[200].push(q);
          else if (pts <= 400)  byTier[400].push(q);
          else                  byTier[600].push(q);
        }

        // Shuffle each tier
        for (const tier of POINT_TIERS) {
          const key = `${catIdx}_${tier}`;
          pools[key] = shuffleArray(byTier[tier]);
          pointers[key] = 0;
        }

        // Assign initial 6 questions (slot 0-5)
        const slots: Question[] = [];
        for (let slotIdx = 0; slotIdx < 6; slotIdx++) {
          const tier = POINT_TIERS[Math.floor(slotIdx / SLOTS_PER_TIER)];
          const key = `${catIdx}_${tier}`;
          const pool = pools[key] || [];
          const ptr = pointers[key] ?? 0;
          if (pool.length > 0) {
            slots[slotIdx] = pool[ptr % pool.length];
            pointers[key] = (ptr + 1) % pool.length; // advance every slot → different questions
          } else {
            // fallback placeholder
            slots[slotIdx] = {
              id: `placeholder-${catIdx}-${slotIdx}`,
              category_id: String(category.id),
              question: { ar: '—', en: '—' },
              answer: { ar: '—', en: '—' },
              points: POINT_TIERS[Math.floor(slotIdx / SLOTS_PER_TIER)],
              difficulty: 'easy',
              image: '',
              answerImage: ''
            } as Question;
          }
        }
        initial[String(catIdx)] = slots;
      } catch {
        // fallback: empty slots
        initial[String(catIdx)] = [];
      }
    }

    setQuestionPools(pools);
    setPoolPointers(pointers);
    setSessionQuestions(initial);
    setGameLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Advance to next round of questions (cycle through pools)
  const advanceSessionQuestions = useCallback((currentPools: Record<string, Question[]>, currentPointers: Record<string, number>) => {
    const newPointers = { ...currentPointers };
    const newSession: Record<string, Question[]> = {};

    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const slots: Question[] = [];
      for (let slotIdx = 0; slotIdx < 6; slotIdx++) {
        const tier = POINT_TIERS[Math.floor(slotIdx / SLOTS_PER_TIER)];
        const key = `${catIdx}_${tier}`;
        const pool = currentPools[key] || [];
        const ptr = newPointers[key] ?? 0;
        if (pool.length > 0) {
          slots[slotIdx] = pool[ptr % pool.length];
          newPointers[key] = (ptr + 1) % pool.length;
        }
      }
      newSession[String(catIdx)] = slots;
    }

    setPoolPointers(newPointers);
    setSessionQuestions(newSession);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    if (currentQuestion && !currentQuestion.showAnswer && !currentQuestion.isPaused) {
      const timer = setInterval(() => {
        setCurrentQuestion(prev => {
          if (!prev) return null;
          return { ...prev, timeElapsed: prev.timeElapsed + 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion]);

  // Call-a-friend countdown (stable in parent state — no nested component reset)
  useEffect(() => {
    if (!cfStarted || cfDone) return;
    if (cfSeconds <= 0) { setCfDone(true); return; }
    const t = setTimeout(() => setCfSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cfStarted, cfSeconds, cfDone]);


  // "ولا كلمة" countdown timer
  useEffect(() => {
    if (wcTimerStarted && !wcTimerDone && wcTimerValue > 0) {
      wcTimerRef.current = setInterval(() => {
        setWcTimerValue(v => {
          if (v <= 1) {
            setWcTimerDone(true);
            if (wcTimerRef.current) clearInterval(wcTimerRef.current);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
    return () => { if (wcTimerRef.current) clearInterval(wcTimerRef.current); };
  }, [wcTimerStarted, wcTimerDone]);

  // Reset WC timer when question changes
  useEffect(() => {
    if (wcTimerRef.current) clearInterval(wcTimerRef.current);
    setWcTimerStarted(false);
    setWcTimerDone(false);
    if (currentQuestion) {
      const pts = Number(currentQuestion.question.points);
      const initSecs = pts >= 600 ? 60 : pts >= 400 ? 45 : 30;
      setWcTimerValue(initSecs);
    }
  }, [currentQuestion?.questionIndex, currentQuestion?.categoryIndex]);

  const createGameSessionInBackend = async (): Promise<number | null> => {
    try {
      if (backendGameId) {
        return backendGameId;
      }

      const createdGame = await gamesAPI.create({
        sessionName: config.sessionName,
        team1Name: config.team1Name,
        team2Name: config.team2Name
      });

      const gameId = createdGame?.data?.id;

      if (!gameId) {
        console.error('No game ID returned from backend');
        return null;
      }

      setBackendGameId(gameId);
      localStorage.setItem('currentGameId', String(gameId));

      return gameId;
    } catch (error) {
      console.error('Failed to create game session in backend:', error);
      return null;
    }
  };

  useEffect(() => {
    void createGameSessionInBackend();
  }, []);

  useEffect(() => {
    void loadAllQuestions();
  }, [loadAllQuestions]);


  const saveGameToBackend = async (winner: string, team1Score: number, team2Score: number) => {
    try {
      const gameId = backendGameId || (await createGameSessionInBackend());

      if (!gameId) {
        console.error('Cannot save game because game session was not created');
        return;
      }

      await gamesAPI.updateScores(gameId, {
        team1Score,
        team2Score
      });

      await gamesAPI.end(gameId, winner || undefined);

      localStorage.removeItem('currentGameId');
      setBackendGameId(null);
    } catch (error) {
      console.error('Failed to save game to backend:', error);
    }
  };

  const abandonGameInBackend = async () => {
    try {
      const savedId = localStorage.getItem('currentGameId');
      const gameId = backendGameId || (savedId ? Number(savedId) : null);

      if (!gameId) return;

      await gamesAPI.abandon(gameId);

      localStorage.removeItem('currentGameId');
      setBackendGameId(null);
    } catch (error) {
      console.error('Failed to abandon game:', error);
    }
  };

  const finishGame = async (team1Score: number, team2Score: number) => {
    const winner =
      team1Score > team2Score
        ? config.team1Name
        : team2Score > team1Score
        ? config.team2Name
        : '';

    await saveGameToBackend(winner, team1Score, team2Score);
    onEnd(winner, team1Score, team2Score);
  };

  const handleQuestionClick = (categoryIndex: number, questionIndex: number, team: 1 | 2) => {
    const questionKey = `${categoryIndex}-${questionIndex}`;
    if (gameState.answeredQuestions.has(questionKey)) return;

    if (gameState.blockedTeam === team) {
      showPowerupMessage(
        'https://i.imgur.com/VtMtaCu.png',
        language === 'ar' ? 'الفريق الخصم استخدم منع الخصم!' : 'Opponent used block!'
      );
      setGameState(prev => ({ ...prev, blockedTeam: null }));
      return;
    }

    // Use pre-loaded session question
    const slots = sessionQuestions[String(categoryIndex)];
    const question = slots?.[questionIndex];

    if (!question || question.id?.startsWith('placeholder')) return;

    setCurrentQuestion({
      question,
      categoryIndex,
      questionIndex,
      team,
      timeElapsed: 0,
      showAnswer: false,
      isPaused: false,
      showTeamPicker: false
    });
  };

  const showPowerupMessage = (icon: string, text: string) => {
    setPowerupMessage({ icon, text });
    setTimeout(() => setPowerupMessage(null), 3000);
  };

  const handleAnswer = async (correct: boolean, answeringTeam?: 1 | 2) => {
    if (!currentQuestion) return;

    const ansTeam  = answeringTeam ?? currentQuestion.team;   // الفريق المجاوب
    const turnTeam = currentQuestion.team;                     // الفريق صاحب الدور

    // نقاط السؤال الأصلية - نحوّلها لرقم دائماً
    const basePoints = Number(currentQuestion.question.points) || 0;

    // تدبيل النقاط: يُطبَّق فقط إذا كان الفريق المجاوب هو نفس الفريق صاحب الدور
    const isDoubled = gameState.doublePoints && ansTeam === turnTeam;

    // الفريق المحظور لا يأخذ نقاط حتى لو جاوب صح
    const isBlocked = gameState.blockedTeam === ansTeam;

    const finalPoints = (correct && !isBlocked)
      ? (isDoubled ? basePoints * 2 : basePoints)
      : 0;

    if (correct && finalPoints > 0) {
      setGameState(prev => ({
        ...prev,
        [ansTeam === 1 ? 'team1' : 'team2']: {
          ...prev[ansTeam === 1 ? 'team1' : 'team2'],
          score: prev[ansTeam === 1 ? 'team1' : 'team2'].score + finalPoints
        },
        doublePoints: false,
        blockedTeam: null
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        doublePoints: false,
        blockedTeam: null
      }));
    }

    setGameState(prev => ({
      ...prev,
      answeredQuestions: new Set([
        ...prev.answeredQuestions,
        `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`
      ]),
      currentTurn: prev.currentTurn === 1 ? 2 : 1
    }));

    setCurrentQuestion(null);
    saveGameState();

    const totalAnsweredAfterThisQuestion = gameState.answeredQuestions.size + 1;
    const totalQuestions = categories.length * 6;

    // When all questions answered → cycle to next round instead of ending
    if (totalAnsweredAfterThisQuestion >= totalQuestions) {
      setGameState(prev => ({ ...prev, answeredQuestions: new Set() }));
      advanceSessionQuestions(questionPools, poolPointers);
    }
  };

  const saveGameState = () => {
    const gameData = {
      gameState: {
        team1: gameState.team1,
        team2: gameState.team2,
        currentTurn: gameState.currentTurn,
        answeredQuestions: Array.from(gameState.answeredQuestions),
        doublePoints: gameState.doublePoints,
        blockedTeam: gameState.blockedTeam
      },
      categories: categories.map(c => c.id),
      config,
      timestamp: Date.now()
    };

    localStorage.setItem('savedGame', JSON.stringify(gameData));
  };

  // No popup messages — dimming handles UX. Only callfriend opens a modal.
  const usePowerup = (powerupId: string, team: 1 | 2, _location: 'board' | 'question' = 'board') => {
    const currentTeam = team === 1 ? 'team1' : 'team2';
    if (!gameState[currentTeam].powerUps[powerupId]) return;

    switch (powerupId) {
      case 'double':
        setGameState(prev => ({ ...prev, doublePoints: true }));
        break;
      case 'block':
        setGameState(prev => ({ ...prev, blockedTeam: prev.currentTurn === 1 ? 2 : 1 }));
        break;
      case 'steal':
        // mark steal used - switching turn handled elsewhere
        break;
      case 'callfriend':
        // open modal - powerup consumed on close
        setCurrentQuestion(prev => prev ? { ...prev, showCallFriend: true } : prev);
        return;
      case 'twoanswers':
        // mark as used
        break;
    }

    // consume the powerup
    setGameState(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        powerUps: { ...prev[currentTeam].powerUps, [powerupId]: false }
      }
    }));
  };

  const adjustScore = (team: 1 | 2, delta: number) => {
    setGameState(prev => ({
      ...prev,
      [team === 1 ? 'team1' : 'team2']: {
        ...prev[team === 1 ? 'team1' : 'team2'],
        score: Math.max(0, prev[team === 1 ? 'team1' : 'team2'].score + delta)
      }
    }));
  };

  const resetTimer = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, timeElapsed: 0 });
    }
  };

  const currentTeamName = gameState.currentTurn === 1 ? config.team1Name : config.team2Name;

  // Check if current question is from "ولا كلمة" section
  const isWcCategory = currentQuestion
    ? !!((categories[currentQuestion.categoryIndex] as any)?.section?.includes('ولا') ||
        (categories[currentQuestion.categoryIndex] as any)?.section?.includes('wala') ||
        (categories[currentQuestion.categoryIndex] as any)?.name?.ar?.includes('ولا كلمة'))
    : false;

  const wcInitialTime = currentQuestion
    ? (Number(currentQuestion.question.points) >= 600 ? 60 : Number(currentQuestion.question.points) >= 400 ? 45 : 30)
    : 60;

  const wcProgress = wcTimerValue / wcInitialTime;

  /* ─── Call Friend Timer Component ─── */
  const ScoreBox = ({
    points, isAnswered, onClick,
  }: { points: number; isAnswered: boolean; onClick: () => void }) => (
    <button onClick={onClick} disabled={isAnswered || loadingQuestion}
      className={`w-full h-full font-bold text-xl md:text-2xl rounded-2xl transition-all flex items-center justify-center select-none
        ${isAnswered
          ? 'bg-[#2A1505]/30 text-white/20 cursor-not-allowed'
          : 'bg-[#2A1505] text-white hover:bg-[#5D3A1A] hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer'}`}>
      {points}
    </button>
  );

  const CategoryCard = ({ category, catIndex }: { category: Category; catIndex: number }) => (
    <div className="rounded-3xl overflow-hidden shadow-xl h-full flex flex-col bg-[#1A0A00]">
      <div className="grid grid-cols-3 flex-1 gap-2 p-2">
        <div className="grid grid-rows-3 gap-2">
          {[200, 400, 600].map((pts, idx) => {
            const qIdx = idx * 2;
            const key = `${catIndex}-${qIdx}`;
            return <ScoreBox key={`L-${pts}`} points={pts} isAnswered={gameState.answeredQuestions.has(key)} onClick={() => void handleQuestionClick(catIndex, qIdx, 1)} />;
          })}
        </div>
        <div className="relative rounded-2xl overflow-hidden">
          <img src={category.image} alt={category.name[language]} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="grid grid-rows-3 gap-2">
          {[200, 400, 600].map((pts, idx) => {
            const qIdx = idx * 2 + 1;
            const key = `${catIndex}-${qIdx}`;
            return <ScoreBox key={`R-${pts}`} points={pts} isAnswered={gameState.answeredQuestions.has(key)} onClick={() => void handleQuestionClick(catIndex, qIdx, 2)} />;
          })}
        </div>
      </div>
      <div className="bg-[#8B5A2B] text-white text-center py-2 px-2 shrink-0">
        <p className="font-bold text-sm md:text-base truncate">{category.name[language]}</p>

      </div>
    </div>
  );

  /* Show context-aware power-ups: board = before question, question = inside overlay */
  const SelectedPowerups = ({ team, location = 'board' }: { team: 1 | 2; location?: 'board' | 'question' }) => {
    const selectedIds = team === 1 ? config.team1Powerups : config.team2Powerups;
    const teamState   = team === 1 ? gameState.team1.powerUps : gameState.team2.powerUps;
    const isMine      = gameState.currentTurn === team;

    /*
     * isEnabled: can this powerup be CLICKED right now?
     *
     * callfriend  → only inside question, only active team
     * twoanswers  → active team always (board + question), non-active: never
     * steal       → non-active team, board only; disabled after question opened
     * block       → active team always (board + question), non-active: never
     * double      → active team, board only; disabled inside question
     */
    const isEnabled = (id: string): boolean => {
      if (!teamState[id]) return false; // already used
      switch (id) {
        case 'callfriend':  return isMine && location === 'question';
        case 'twoanswers':  return isMine; // board + question
        case 'steal':       return !isMine && location === 'board';
        case 'block':       return isMine; // board + question
        case 'double':      return isMine && location === 'board';
        default:            return false;
      }
    };

    const selected = powerUps.filter(p => selectedIds.includes(p.id));
    if (selected.length === 0) return <p className="text-[#C4A882]/30 text-xs text-center">—</p>;

    return (
      <div className="flex gap-2 justify-center flex-wrap">
        {selected.map(power => {
          const enabled = isEnabled(power.id);
          return (
            <button
              key={power.id}
              onClick={() => { if (enabled) usePowerup(power.id, team, location); }}
              title={power.name[language]}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all relative overflow-hidden
                ${enabled
                  ? 'bg-[#5D3A1A] border-[#C4A882] hover:bg-[#8B5A2B] hover:scale-110 shadow-lg cursor-pointer'
                  : 'bg-[#2A1505] border-[#4A2810] cursor-not-allowed'
                }`}
            >
              <img
                src={power.icon}
                alt={power.name[language]}
                className={`w-5 h-5 md:w-6 md:h-6 transition-opacity ${enabled ? 'opacity-100' : 'opacity-20'}`}
              />
              {!enabled && (
                <div className="absolute inset-0 rounded-full bg-black/50" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const ScoreControl = ({ team }: { team: 1 | 2 }) => {
    const score = team === 1 ? gameState.team1.score : gameState.team2.score;
    return (
      <div className="flex items-center gap-2 bg-[#3D2008] rounded-2xl px-3 py-2 shadow-inner">
        <button onClick={() => adjustScore(team, -100)} className="w-8 h-8 bg-[#8B5A2B] hover:bg-[#5D3A1A] text-white rounded-full font-bold text-lg flex items-center justify-center">−</button>
        <span className="w-14 text-center text-white font-bold text-2xl tabular-nums">{score}</span>
        <button onClick={() => adjustScore(team, 100)} className="w-8 h-8 bg-[#8B5A2B] hover:bg-[#5D3A1A] text-white rounded-full font-bold text-lg flex items-center justify-center">+</button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F0E0C8]" dir={dir}>

      {/* ═══ HEADER ═══ */}
      <header className="bg-gradient-to-r from-[#3D1A00] to-[#7A4A1A] text-white p-2 md:p-3 shrink-0 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onExit()} className="bg-white/15 hover:bg-white/30 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-white/20">
              <Home size={16}/>{language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <button onClick={() => setShowConfirmExit(true)} className="bg-white/15 hover:bg-white/30 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-white/20">
              <LogOut size={16}/>{t('exit', language)}
            </button>
            <button onClick={() => setShowConfirmEnd(true)} className="bg-white/15 hover:bg-white/30 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border border-white/20">
              <Flag size={16}/>{t('endGame', language)}
            </button>
          </div>
          <div className="flex flex-col items-center">
            <img src={gameLogo} alt="Clash of Minds" className="w-20 md:w-28" />
            {config.sessionName && <span className="text-white/70 text-xs mt-0.5">{config.sessionName}</span>}
          </div>
          <div className="bg-[#C4A882] text-[#2A1505] px-5 py-2 rounded-full font-bold text-sm md:text-base shadow-lg">
            {language === 'ar' ? `دور: ${currentTeamName}` : `Turn: ${currentTeamName}`}
          </div>
        </div>
      </header>

      {/* ═══ BOARD ═══ */}
      <main className="flex-1 p-2 md:p-3 overflow-hidden bg-[#F0E0C8]">
        {gameLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#5D3A1A] font-bold text-xl">
              {language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
            </p>
          </div>
        ) : (
          <div className="h-full max-w-[1600px] mx-auto grid grid-cols-3 grid-rows-2 gap-2 md:gap-3">
            {categories.map((cat, i) => <CategoryCard key={cat.id} category={cat} catIndex={i} />)}
          </div>
        )}
      </main>

      {/* ═══ BOTTOM BAR ═══ */}
      <div className="bg-[#4A2810] border-t-4 border-[#8B5A2B] shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-3 px-4 py-3">

          {/* Team 1 */}
          <div className="flex items-center gap-3">
            <div className={`px-5 py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap shadow-md transition-all
              ${gameState.currentTurn === 1 ? 'bg-[#C4A882] text-[#1A0A00] scale-105' : 'bg-[#5D3A1A] text-white/80'}`}>
              {config.team1Name}
            </div>
            <ScoreControl team={1} />
            <div className="flex flex-col items-center gap-1">
              <p className="text-[#C4A882] text-xs font-bold">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
              <SelectedPowerups team={1} location="board" />
            </div>
          </div>

          <div className="bg-[#3D2008] px-4 py-2 rounded-xl text-center border border-[#8B5A2B]/40 hidden md:block">
            <p className="text-[#C4A882]/70 text-xs">{language === 'ar' ? 'دور' : 'Turn'}</p>
            <p className="text-[#C4A882] font-bold">{currentTeamName}</p>
          </div>

          {/* Team 2 */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[#C4A882] text-xs font-bold">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
              <SelectedPowerups team={2} location="board" />
            </div>
            <ScoreControl team={2} />
            <div className={`px-5 py-2.5 rounded-full font-bold text-sm md:text-base whitespace-nowrap shadow-md transition-all
              ${gameState.currentTurn === 2 ? 'bg-[#C4A882] text-[#1A0A00] scale-105' : 'bg-[#5D3A1A] text-white/80'}`}>
              {config.team2Name}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ QUESTION OVERLAY — seenjeem style ═══ */}
      {currentQuestion && (
        <div className="fixed inset-0 z-[10000] bg-[#1A0A00]/95 flex flex-col" dir={dir}>

          {/* Same header */}
          <div className="bg-gradient-to-r from-[#3D1A00] to-[#7A4A1A] p-2 md:p-3 shrink-0 flex items-center justify-between gap-2">
            <button onClick={() => setCurrentQuestion(null)} className="bg-white/15 hover:bg-white/30 px-3 py-2 rounded-xl flex items-center gap-2 text-white text-sm font-bold border border-white/20">
              <ArrowLeft size={16}/>{language === 'ar' ? 'عودة' : 'Back'}
            </button>
            <img src={gameLogo} alt="" className="w-20 md:w-24" />
            <div className="bg-[#C4A882] text-[#2A1505] px-5 py-2 rounded-full font-bold text-sm">
              {language === 'ar' ? `دور: ${currentTeamName}` : `Turn: ${currentTeamName}`}
            </div>
          </div>

          {/* Content: Question card (left) + Sidebar (right) */}
          {/* ═══ TEAM PICKER — full seenjeem-style page ═══ */}
          {currentQuestion.showTeamPicker && (
            <div className="absolute inset-0 z-20 bg-[#2A1505] flex flex-col">
              {/* header */}
              <div className="bg-gradient-to-r from-[#3D1A00] to-[#7A4A1A] p-3 flex items-center justify-between shrink-0">
                <button onClick={() => setCurrentQuestion({ ...currentQuestion, showTeamPicker: false })}
                  className="bg-white/15 hover:bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-white font-bold border border-white/20 transition-colors">
                  <ArrowLeft size={16}/>
                  {language === 'ar' ? 'العودة للإجابة' : 'Back to Answer'}
                </button>
                <img src={gameLogo} alt="" className="w-20 md:w-24"/>
                <div className="bg-[#C4A882] text-[#2A1505] px-5 py-2 rounded-full font-bold text-sm">
                  {language === 'ar' ? `دور: ${currentTeamName}` : `Turn: ${currentTeamName}`}
                </div>
              </div>

              {/* body */}
              <div className="flex flex-1">
                {/* main */}
                <div className="flex-1 border-4 border-[#8B5A2B] m-3 rounded-3xl bg-[#F5EDD8] flex flex-col items-center justify-center gap-8 p-8">
                  <h2 className="text-[#3D1A00] text-3xl md:text-4xl font-bold text-center">
                    {language === 'ar' ? 'أي فريق جاوب صح ؟' : 'Which team answered correctly?'}
                  </h2>
                  <div className="flex gap-6 flex-wrap justify-center">
                    <button onClick={() => void handleAnswer(true, 1)}
                      className="bg-[#5D3A1A] hover:bg-[#3D1A00] text-white px-14 py-7 rounded-3xl font-bold text-3xl transition-all hover:scale-105 shadow-xl">
                      {config.team1Name}
                    </button>
                    <button onClick={() => void handleAnswer(true, 2)}
                      disabled={gameState.blockedTeam === 2}
                      className={`px-14 py-7 rounded-3xl font-bold text-3xl transition-all shadow-xl
                        ${gameState.blockedTeam === 2
                          ? 'bg-gray-400/50 text-white/30 cursor-not-allowed'
                          : 'bg-[#5D3A1A] hover:bg-[#3D1A00] text-white hover:scale-105'}`}>
                      {config.team2Name}
                      {gameState.blockedTeam === 2 && <span className="block text-sm mt-1 opacity-60">{language === 'ar' ? '(محظور)' : '(blocked)'}</span>}
                    </button>
                  </div>
                  <button onClick={() => void handleAnswer(false)}
                    className="bg-[#C4A882]/30 hover:bg-[#C4A882]/50 text-[#5D3A1A] px-16 py-5 rounded-3xl font-bold text-xl transition-all min-w-[280px] border-2 border-[#8B5A2B]/30">
                    {language === 'ar' ? 'ولا أحد' : 'No one'}
                  </button>
                </div>

                {/* sidebar */}
                <div className="w-56 md:w-64 flex flex-col gap-3 p-3 shrink-0">
                  <div className="bg-[#2A1505] rounded-2xl p-4 border border-[#5D3A1A] flex flex-col gap-2">
                    <div className={`w-full py-2 rounded-full text-center font-bold text-sm ${gameState.currentTurn === 1 ? 'bg-[#C4A882] text-[#1A0A00]' : 'bg-[#5D3A1A] text-white'}`}>{config.team1Name}</div>
                    <p className="text-white text-center text-2xl font-bold">{gameState.team1.score}</p>
                    <p className="text-[#C4A882] text-xs text-center">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
                    <SelectedPowerups team={1} location="question"/>
                  </div>
                  <div className="bg-[#2A1505] rounded-2xl p-4 border border-[#5D3A1A] flex flex-col gap-2">
                    <div className={`w-full py-2 rounded-full text-center font-bold text-sm ${gameState.currentTurn === 2 ? 'bg-[#C4A882] text-[#1A0A00]' : 'bg-[#5D3A1A] text-white'}`}>{config.team2Name}</div>
                    <p className="text-white text-center text-2xl font-bold">{gameState.team2.score}</p>
                    <p className="text-[#C4A882] text-xs text-center">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
                    <SelectedPowerups team={2} location="question"/>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex gap-3 p-3 overflow-hidden relative">

            {/* WC Timer — floats in the gap between question card and right screen edge */}
            {isWcCategory && (
              <div className="absolute right-40 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#C4A882" strokeWidth="6" opacity="0.2"/>
                    <circle cx="48" cy="48" r="40" fill="none"
                      stroke={wcTimerDone ? '#dc2626' : wcTimerValue <= 10 ? '#f97316' : '#8B5A2B'}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - wcProgress)}
                      style={{transition: 'stroke-dashoffset 1s linear, stroke 0.3s'}}/>
                  </svg>
                  <span className={`text-2xl font-bold font-mono relative z-10 ${wcTimerDone ? 'text-red-500' : wcTimerValue <= 10 ? 'text-orange-500' : 'text-[#3D1A00]'}`}>
                    {wcTimerValue}
                  </span>
                </div>
                {!wcTimerStarted && !wcTimerDone && (
                  <button onClick={() => setWcTimerStarted(true)}
                    className="bg-[#5D3A1A] hover:bg-[#3D1A00] text-white px-3 py-1.5 rounded-full font-bold text-xs transition-all hover:scale-105 border border-[#C4A882]/30">
                    {language === 'ar' ? 'ابدأ' : 'Start'}
                  </button>
                )}
                {wcTimerDone && (
                  <span className="text-red-400 font-bold text-xs animate-pulse text-center">
                    {language === 'ar' ? 'انتهى!' : 'Up!'}
                  </span>
                )}
              </div>
            )}

            {/* ── Question card ── */}
            <div className="flex-1 border-4 border-[#8B5A2B] rounded-3xl flex flex-col bg-[#F0E0C8] overflow-hidden relative">

              {/* Timer bar inside card */}
              <div className="bg-[#2A1505] flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentQuestion({...currentQuestion, isPaused: !currentQuestion.isPaused})}
                    className="text-white hover:text-[#C4A882] transition-colors">
                    {currentQuestion.isPaused ? <Play size={22}/> : <Pause size={22}/>}
                  </button>
                  <span className="text-white font-mono text-2xl font-bold">
                    {String(Math.floor(currentQuestion.timeElapsed/60)).padStart(2,'0')}:
                    {String(currentQuestion.timeElapsed%60).padStart(2,'0')}
                  </span>
                  <button onClick={resetTimer} className="text-white hover:text-[#C4A882] transition-colors">
                    <RotateCcw size={20}/>
                  </button>
                </div>
                <div className="bg-[#C4A882] text-[#2A1505] px-4 py-1.5 rounded-full font-bold">
                  {currentQuestion.question.points} {language === 'ar' ? 'نقطة' : 'pts'}
                </div>
              </div>

              {/* Question content */}
              {!currentQuestion.showAnswer ? (
                <div className="flex-1 flex flex-col p-4 overflow-auto">
                  {/* Question text above image */}
                  <h2 className="text-[#3D1A00] text-xl md:text-3xl font-bold text-center mb-4 leading-relaxed">
                    {currentQuestion.question?.question?.[language] || ''}
                  </h2>

                  {/* Image — fills remaining space */}
                  <div className="flex-1 min-h-0 flex items-center justify-center relative">
                    {currentQuestion.question.image ? (
                      <div className="relative group cursor-zoom-in h-full w-full flex items-center justify-center"
                        onClick={() => { setLightboxImage(currentQuestion.question.image ?? null); setLightboxZoom(1); }}>
                        <img src={currentQuestion.question.image} alt="Question"
                          className="max-h-full max-w-full object-contain rounded-2xl shadow-xl border-2 border-[#8B5A2B]/30 transition-transform group-hover:scale-[1.03]" />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] rounded-2xl flex items-center justify-center">
                        <span className="text-7xl">❓</span>
                      </div>
                    )}

                  </div>

                  {/* Bottom bar inside card */}
                  <div className="flex items-center justify-between mt-4 shrink-0">
                    <button onClick={() => setCurrentQuestion({...currentQuestion, showAnswer: true})}
                      className="bg-[#5D3A1A] hover:bg-[#3D1A00] text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
                      {language === 'ar' ? 'اظهار الإجابة' : 'Show Answer'}
                    </button>
                    <div className="bg-[#8B5A2B] text-white px-4 py-2 rounded-full font-bold text-sm">
                      {categories[currentQuestion.categoryIndex]?.name[language] || ''}
                    </div>
                  </div>
                </div>
              ) : (
                /* Answer state */
                <div className="flex-1 flex flex-col p-4 overflow-auto">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {currentQuestion.question.answerImage && (
                      <div className="relative group cursor-zoom-in mb-4" onClick={() => { setLightboxImage(currentQuestion.question.answerImage ?? null); setLightboxZoom(1); }}>
                        <img src={currentQuestion.question.answerImage} alt="Answer"
                          className="max-h-72 max-w-full object-contain rounded-2xl shadow-xl border-2 border-[#8B5A2B]/30 transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <p className="text-[#8B5A2B] text-lg mb-2">{language === 'ar' ? 'الإجابة:' : 'Answer:'}</p>
                    <p className="text-[#3D1A00] text-3xl md:text-4xl font-bold text-center mb-6">
                      {typeof currentQuestion.question?.answer === 'object'
                        ? currentQuestion.question?.answer?.[language] || ''
                        : currentQuestion.question?.answer || ''}
                    </p>

                    <button
                      onClick={() => setCurrentQuestion({ ...currentQuestion, showTeamPicker: true })}
                      className="bg-[#5D3A1A] hover:bg-[#8B5A2B] text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-lg">
                      {language === 'ar' ? 'أي فريق؟' : 'Which team?'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 shrink-0">
                    <button onClick={() => setCurrentQuestion({...currentQuestion, showAnswer: false})}
                      className="border-2 border-[#8B5A2B] text-[#8B5A2B] px-6 py-2 rounded-full font-bold hover:bg-[#8B5A2B] hover:text-white transition-all">
                      {language === 'ar' ? '← العودة للسؤال' : '← Back'}
                    </button>
                    <div className="bg-[#8B5A2B] text-white px-4 py-2 rounded-full font-bold text-sm">
                      {categories[currentQuestion.categoryIndex]?.name[language] || ''}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Sidebar: both teams ── */}
            <div className="w-56 md:w-64 flex flex-col gap-3 shrink-0">

              {/* Team 1 */}
              <div className="bg-[#2A1505] rounded-2xl p-4 border border-[#5D3A1A] flex flex-col gap-3">
                <div className={`w-full py-2.5 rounded-full text-center font-bold text-sm transition-all
                  ${gameState.currentTurn === 1 ? 'bg-[#C4A882] text-[#1A0A00]' : 'bg-[#5D3A1A] text-white'}`}>
                  {config.team1Name}
                </div>
                <p className="text-white text-center text-3xl font-bold">{gameState.team1.score}</p>
                <div>
                  <p className="text-[#C4A882] text-xs text-center mb-2">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
                  <SelectedPowerups team={1} location="question" />
                </div>
              </div>

              {/* Report */}
              <button onClick={() => setShowReportModal(true)}
                className="bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-bold">
                <AlertTriangle size={16}/>{language === 'ar' ? 'ابلاغ' : 'Report'}
              </button>

              {/* Team 2 */}
              <div className="bg-[#2A1505] rounded-2xl p-4 border border-[#5D3A1A] flex flex-col gap-3">
                <div className={`w-full py-2.5 rounded-full text-center font-bold text-sm transition-all
                  ${gameState.currentTurn === 2 ? 'bg-[#C4A882] text-[#1A0A00]' : 'bg-[#5D3A1A] text-white'}`}>
                  {config.team2Name}
                </div>
                <p className="text-white text-center text-3xl font-bold">{gameState.team2.score}</p>
                <div>
                  <p className="text-[#C4A882] text-xs text-center mb-2">{language === 'ar' ? 'وسائل المساعدة' : 'Power-Ups'}</p>
                  <SelectedPowerups team={2} location="question" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CALL FRIEND MODAL ═══ */}
      {currentQuestion?.showCallFriend && (() => {
        const cfCirc = 2 * Math.PI * 54;
        const cfProgress = cfCirc * (1 - cfSeconds / 30);
        const closeCf = () => {
          const team = currentQuestion?.team ?? 1;
          const teamKey = team === 1 ? 'team1' : 'team2';
          setGameState(prev => ({
            ...prev,
            [teamKey]: { ...prev[teamKey], powerUps: { ...prev[teamKey].powerUps, callfriend: false } }
          }));
          setCurrentQuestion(prev => prev ? { ...prev, showCallFriend: false } : prev);
          setCfStarted(false); setCfSeconds(30); setCfDone(false);
        };
        return (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70">
            <div className="bg-[#F0E0C8] rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border-4 border-[#8B5A2B] text-center">
              <img src="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1777546198/call_a_friend_bcblxt.png"
                alt="call" className="w-20 h-20 mx-auto mb-3 object-contain" />
              <h2 className="text-[#3D1A00] text-2xl font-bold mb-2">
                {language === 'ar' ? 'الاتصال بصديق' : 'Call a Friend'}
              </h2>
              <p className="text-[#5D3A1A] text-sm mb-5 leading-relaxed">
                {language === 'ar'
                  ? 'لديك 30 ثانية للاتصال بصديق وطلب المساعدة. ابدأ العداد أول ما يرد الشخص!'
                  : 'You have 30 seconds to call a friend. Start the timer when they answer!'}
              </p>

              {!cfStarted && !cfDone && (
                <button onClick={() => setCfStarted(true)}
                  className="bg-[#5D3A1A] hover:bg-[#3D1A00] text-white px-10 py-3 rounded-2xl font-bold text-lg mb-4 transition-all hover:scale-105">
                  {language === 'ar' ? '▶ ابدأ' : '▶ Start'}
                </button>
              )}

              {cfStarted && !cfDone && (
                <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
                  <svg className="absolute inset-0 -rotate-90" width="128" height="128" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#C4A882" strokeWidth="8" opacity="0.2"/>
                    <circle cx="64" cy="64" r="54" fill="none"
                      stroke={cfSeconds <= 10 ? '#dc2626' : '#8B5A2B'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={cfCirc}
                      strokeDashoffset={cfProgress}
                      style={{transition: 'stroke-dashoffset 1s linear, stroke 0.3s'}}/>
                  </svg>
                  <span className={`text-4xl font-bold font-mono ${cfSeconds <= 10 ? 'text-red-600' : 'text-[#3D1A00]'}`}>
                    {cfSeconds}
                  </span>
                </div>
              )}

              {cfDone && (
                <div className="text-red-600 text-xl font-bold mb-4">
                  {language === 'ar' ? '⏰ انتهى الوقت!' : "⏰ Time's up!"}
                </div>
              )}

              <button onClick={closeCf}
                className="bg-[#8B5A2B] hover:bg-[#5D3A1A] text-white px-8 py-3 rounded-2xl font-bold transition-all w-full">
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Powerup message popup */}
      {powerupMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] bg-white rounded-3xl p-8 shadow-2xl text-center">
          <img src={powerupMessage.icon} alt="" className="w-24 h-24 mx-auto mb-4" />
          <p className="text-[#5D3A1A] text-2xl font-bold">{powerupMessage.text}</p>
        </div>
      )}

      {/* ═══ REPORT MODAL — z-[20000] so it appears above question overlay ═══ */}
      {showReportModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-4 border-[#8B5A2B] shadow-2xl relative animate-fadeIn">
            <button onClick={() => { setShowReportModal(false); setReportText(''); setReportSent(false); setReportSending(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              ✕
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-3">
              <img src="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1779754523/ChatGPT_Image_May_26_2026_03_14_07_AM_ihw9fa.png"
                alt="report" className="w-20 h-20 object-contain" />
            </div>

            {!reportSent ? (
              <>
                <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4 text-center">
                  {language === 'ar' ? 'ابلاغ عن مشكلة' : 'Report Issue'}
                </h3>
                <textarea
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 h-32 resize-none focus:border-[#8B5A2B] outline-none"
                  placeholder={language === 'ar' ? 'اكتب وصف المشكلة...' : 'Describe the issue...'}
                />
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setShowReportModal(false); setReportText(''); }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                    {language === 'ar' ? 'الغاء' : 'Cancel'}
                  </button>
                  <button
                    disabled={reportSending || !reportText.trim()}
                    onClick={async () => {
                      if (!reportText.trim()) return;
                      setReportSending(true);
                      try {
                        const token = localStorage.getItem('token');
                        await fetch(`${API_URL}/api/reports`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            description: reportText.trim(),
                            questionId: currentQuestion?.question?.id ?? null,
                            categoryId: currentQuestion ? categories[currentQuestion.categoryIndex]?.id : null,
                            username: (() => { try { return JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30=')).username || null; } catch { return null; } })(),
                            email: (() => { try { return JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1] || 'e30=')).email || null; } catch { return null; } })()
                          })
                        });
                        setReportSent(true);
                      } catch {
                        setReportSent(true); // show success even if request fails
                      } finally {
                        setReportSending(false);
                      }
                    }}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center gap-2">
                    {reportSending
                      ? <span className="animate-spin">⏳</span>
                      : (language === 'ar' ? 'ارسال' : 'Send')}
                  </button>
                </div>
              </>
            ) : (
              /* Success state */
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {language === 'ar' ? 'تم إرسال الابلاغ' : 'Report Sent'}
                </p>
                <p className="text-gray-500 mb-6 text-sm">
                  {language === 'ar' ? 'شكراً، سيتم مراجعة الابلاغ قريباً' : 'Thank you, we will review it soon.'}
                </p>
                <button onClick={() => { setShowReportModal(false); setReportText(''); setReportSent(false); }}
                  className="px-8 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold hover:bg-[#5D3A1A] transition-colors">
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showConfirmExit} onClose={() => setShowConfirmExit(false)} title={language === 'ar' ? 'تأكيد الخروج' : 'Confirm Exit'} icon="⚠️">
        <div className="flex gap-4 justify-center flex-wrap mt-4">
          <button onClick={() => setShowConfirmExit(false)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold">{language === 'ar' ? 'الغاء' : 'Cancel'}</button>
          <button onClick={() => { saveGameState(); onExit(); }} className="px-6 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold">{language === 'ar' ? 'حفظ وخروج' : 'Save & Exit'}</button>
          <button onClick={() => { void abandonGameInBackend(); onExit(); }} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold">{language === 'ar' ? 'خروج بدون حفظ' : 'Exit Without Save'}</button>
        </div>
      </Modal>

      <Modal isOpen={showConfirmEnd} onClose={() => setShowConfirmEnd(false)} title={language === 'ar' ? 'انهاء اللعبة' : 'End Game'} icon="🏁">
        <div className="flex gap-4 justify-center mt-4">
          <button onClick={() => setShowConfirmEnd(false)} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold">{language === 'ar' ? 'الغاء' : 'Cancel'}</button>
          <button onClick={() => { void finishGame(gameState.team1.score, gameState.team2.score); }} className="px-6 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold">{t('endGame', language)}</button>
        </div>
      </Modal>

      {/* ═══ IMAGE LIGHTBOX ═══ */}
      {lightboxImage && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[30000] bg-black/90 flex flex-col items-center justify-center"
          onWheel={(e) => {
            e.preventDefault();
            setLightboxZoom(z => Math.min(5, Math.max(0.5, z - e.deltaY * 0.001)));
          }}
        >
          {/* Top controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2 z-10">
            <button onClick={() => setLightboxZoom(z => Math.max(0.5, z - 0.25))}
              className="w-9 h-9 bg-white/20 hover:bg-white/40 text-white rounded-full font-bold text-xl flex items-center justify-center transition-colors">
              −
            </button>
            <span className="text-white text-sm font-mono w-14 text-center">
              {Math.round(lightboxZoom * 100)}%
            </span>
            <button onClick={() => setLightboxZoom(z => Math.min(5, z + 0.25))}
              className="w-9 h-9 bg-white/20 hover:bg-white/40 text-white rounded-full font-bold text-xl flex items-center justify-center transition-colors">
              +
            </button>
            <button onClick={() => setLightboxZoom(1)}
              className="text-white/60 hover:text-white text-xs px-2 transition-colors">
              {language === 'ar' ? 'إعادة' : 'Reset'}
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center overflow-hidden w-full p-16">
            <img
              src={lightboxImage}
              alt="Zoom"
              style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.15s ease' }}
              className="max-w-full max-h-full object-contain rounded-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Close button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-11 h-11 bg-white/20 hover:bg-white/40 text-white rounded-full font-bold text-2xl flex items-center justify-center transition-colors z-10"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
