import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, TextInput, Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, GameConfig } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, GAME_LOGO, POWERUPS, getCategoryImageUri } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'GameSetup'>;
type Route = RouteProp<RootStackParamList, 'GameSetup'>;

export default function GameSetupScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { categories } = route.params;

  const [team1Name, setTeam1Name] = useState(ar ? 'الفريق الأول' : 'Team 1');
  const [team2Name, setTeam2Name] = useState(ar ? 'الفريق الثاني' : 'Team 2');
  const [team1Pus, setTeam1Pus] = useState<string[]>(['double']);
  const [team2Pus, setTeam2Pus] = useState<string[]>(['block']);
  const [team1Time, setTeam1Time] = useState(60);
  const [team2Time, setTeam2Time] = useState(60);

  const togglePu = (team: 1 | 2, id: string) => {
    const setter = team === 1 ? setTeam1Pus : setTeam2Pus;
    const current = team === 1 ? team1Pus : team2Pus;
    setter(current.includes(id) ? current.filter((p) => p !== id) : current.length < 3 ? [...current, id] : current);
  };

  const getCatName = (cat: any) =>
    typeof cat.name === 'object' ? cat.name[language] || cat.name.ar : String(cat.name);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>{ar ? '← رجوع' : '← Back'}</Text>
        </TouchableOpacity>
        <Image source={{ uri: GAME_LOGO }} style={s.headerLogo} resizeMode="contain" />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Selected categories strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catStrip}>
          {categories.map((cat) => {
            const uri = getCategoryImageUri(cat.image as string);
            return (
              <View key={String(cat.id)} style={s.catChip}>
                {uri
                  ? <Image source={{ uri }} style={s.catChipImg} />
                  : <View style={[s.catChipImg, { backgroundColor: COLORS.BROWN_BEIGE }]}><Text style={{ fontSize: 14 }}>❓</Text></View>
                }
                <Text style={s.catChipText} numberOfLines={1}>{getCatName(cat)}</Text>
              </View>
            );
          })}
        </ScrollView>

        <TeamCard
          num={1} name={team1Name} setName={setTeam1Name}
          pus={team1Pus} togglePu={(id) => togglePu(1, id)}
          time={team1Time} setTime={setTeam1Time} language={language}
        />

        <View style={s.vs}><Text style={s.vsText}>VS</Text></View>

        <TeamCard
          num={2} name={team2Name} setName={setTeam2Name}
          pus={team2Pus} togglePu={(id) => togglePu(2, id)}
          time={team2Time} setTime={setTeam2Time} language={language}
        />

        <TouchableOpacity
          style={s.startBtn}
          onPress={() =>
            navigation.navigate('Game', {
              config: { sessionName: `${team1Name} vs ${team2Name}`, playerCount: 2, team1Name, team2Name, team1Powerups: team1Pus, team2Powerups: team2Pus, team1Time, team2Time },
              categories,
            })
          }
        >
          <Text style={s.startBtnText}>{ar ? '🎮 ابدأ اللعبة!' : '🎮 Start Game!'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function TeamCard({ num, name, setName, pus, togglePu, time, setTime, language }: any) {
  const ar = language === 'ar';
  const color = num === 1 ? '#6366f1' : '#ec4899';
  return (
    <View style={[tc.card, { borderColor: color }]}>
      <View style={[tc.header, { backgroundColor: color }]}>
        <Text style={tc.title}>{ar ? `الفريق ${num}` : `Team ${num}`}</Text>
      </View>
      <View style={tc.body}>
        <Text style={tc.label}>{ar ? 'اسم الفريق' : 'Team Name'}</Text>
        <TextInput style={[tc.input, { borderColor: color + '80' }]} value={name} onChangeText={setName} maxLength={20} placeholderTextColor={COLORS.TEXT_MUTED} />

        <Text style={tc.label}>{ar ? 'وقت الإجابة (ثانية)' : 'Answer Time (sec)'}</Text>
        <View style={tc.timeRow}>
          {[30, 45, 60, 90, 120].map((t) => (
            <TouchableOpacity key={t} style={[tc.timeBtn, time === t && { backgroundColor: color }]} onPress={() => setTime(t)}>
              <Text style={[tc.timeBtnText, time === t && { color: '#fff' }]}>{t}s</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={tc.label}>{ar ? `وسائل المساعدة (${pus.length}/3)` : `Power-Ups (${pus.length}/3)`}</Text>
        <View style={tc.puGrid}>
          {Object.entries(POWERUPS).map(([id, pu]) => {
            const active = pus.includes(id);
            return (
              <TouchableOpacity key={id} style={[tc.puBtn, active && { borderColor: color, backgroundColor: color + '18' }]} onPress={() => togglePu(id)}>
                <Image source={{ uri: pu.icon_url }} style={tc.puIcon} />
                <Text style={[tc.puName, active && { color }]} numberOfLines={1}>{pu.name[language as 'ar' | 'en']}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const tc = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', borderWidth: 2, marginBottom: 4 },
  header: { paddingHorizontal: 16, paddingVertical: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '900' },
  body: { padding: 14, backgroundColor: '#fff' },
  label: { color: COLORS.TEXT_MUTED, fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  input: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.TEXT_DARK, backgroundColor: COLORS.BG },
  timeRow: { flexDirection: 'row', gap: 6 },
  timeBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.BG, alignItems: 'center', borderWidth: 1, borderColor: COLORS.BROWN_BEIGE },
  timeBtnText: { color: COLORS.BROWN_PRIMARY, fontSize: 12, fontWeight: '700' },
  puGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  puBtn: { width: '30%', paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.BROWN_BEIGE, backgroundColor: COLORS.BG, alignItems: 'center', gap: 4 },
  puIcon: { width: 32, height: 32 },
  puName: { color: COLORS.TEXT_MUTED, fontSize: 10, fontWeight: '700', textAlign: 'center' },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  header: { backgroundColor: COLORS.BROWN_PRIMARY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  backText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerLogo: { flex: 1, height: 36 },
  scroll: { padding: 16, paddingBottom: 40 },
  catStrip: { marginBottom: 16 },
  catChip: { alignItems: 'center', marginRight: 10, width: 60 },
  catChipImg: { width: 48, height: 64, borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  catChipText: { color: COLORS.BROWN_PRIMARY, fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 3 },
  vs: { paddingVertical: 12, alignItems: 'center' },
  vsText: { fontSize: 22, fontWeight: '900', color: COLORS.BROWN_ACCENT },
  startBtn: {
    backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', marginTop: 24,
    shadowColor: COLORS.BROWN_DARKEST, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  startBtnText: { color: '#fff', fontSize: 20, fontWeight: '900' },
});
