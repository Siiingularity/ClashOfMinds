import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, GAME_LOGO } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;
const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { language } = useLanguage();
  const { winner, team1Score, team2Score, config } = route.params;
  const ar = language === 'ar';
  const isDraw = winner === 'draw';
  const t1Wins = winner === config.team1Name;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Image source={{ uri: GAME_LOGO }} style={s.logo} resizeMode="contain" />

        <View style={s.trophyBox}>
          <Text style={s.trophyEmoji}>{isDraw ? '🤝' : '🏆'}</Text>
        </View>

        <Text style={s.title}>{isDraw ? (ar ? 'تعادل!' : 'Draw!') : (ar ? 'تهانينا! 🎉' : 'Congratulations! 🎉')}</Text>
        {!isDraw && <Text style={s.winnerName}>{winner}</Text>}
        <Text style={s.subtitle}>{isDraw ? (ar ? 'كلا الفريقين رائعان!' : 'Both teams are great!') : (ar ? 'فاز بالبطولة!' : 'wins!')}</Text>

        <View style={s.scoreCard}>
          <Row name={config.team1Name} score={team1Score} wins={t1Wins} />
          <View style={s.divider} />
          <Row name={config.team2Name} score={team2Score} wins={!t1Wins && !isDraw} />
        </View>

        {!isDraw && (
          <Text style={s.margin}>
            {ar ? `الفارق: ${Math.abs(team1Score - team2Score)} نقطة` : `Margin: ${Math.abs(team1Score - team2Score)} pts`}
          </Text>
        )}

        <TouchableOpacity style={s.playAgain} onPress={() => navigation.navigate('CategorySelection')}>
          <Text style={s.playAgainText}>🎮 {ar ? 'لعبة جديدة' : 'New Game'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Landing')}>
          <Text style={s.homeBtnText}>🏠 {ar ? 'الرئيسية' : 'Home'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ name, score, wins }: { name: string; score: number; wins: boolean }) {
  return (
    <View style={[r.row, wins && r.winRow]}>
      {wins && <Text style={r.crown}>👑</Text>}
      <Text style={r.name} numberOfLines={1}>{name}</Text>
      <Text style={[r.score, wins && r.scoreWin]}>{score}</Text>
    </View>
  );
}
const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  winRow: { backgroundColor: 'rgba(139,90,43,0.1)' },
  crown: { fontSize: 20, marginRight: 8 },
  name: { flex: 1, color: COLORS.BROWN_PRIMARY, fontSize: 16, fontWeight: '800' },
  score: { color: COLORS.BROWN_ACCENT, fontSize: 28, fontWeight: '900' },
  scoreWin: { color: COLORS.BROWN_PRIMARY },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 180, height: 100, marginBottom: 16 },
  trophyBox: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
    borderWidth: 3, borderColor: COLORS.BROWN_BEIGE,
    marginBottom: 16,
  },
  trophyEmoji: { fontSize: 56 },
  title: { color: COLORS.BROWN_PRIMARY, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  winnerName: { color: COLORS.BROWN_ACCENT, fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  subtitle: { color: COLORS.TEXT_MUTED, fontSize: 15, marginTop: 6, marginBottom: 24 },
  scoreCard: {
    backgroundColor: '#fff', borderRadius: 20, width: width - 48,
    shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
    overflow: 'hidden', marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: COLORS.BG },
  margin: { color: COLORS.TEXT_MUTED, fontSize: 13, marginBottom: 28 },
  playAgain: {
    backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 16, paddingVertical: 16,
    width: width - 48, alignItems: 'center',
    shadowColor: COLORS.BROWN_DARKEST, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 7,
    marginBottom: 12,
  },
  playAgainText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  homeBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, width: width - 48, alignItems: 'center', borderWidth: 2, borderColor: COLORS.BROWN_BEIGE },
  homeBtnText: { color: COLORS.BROWN_PRIMARY, fontSize: 16, fontWeight: '700' },
});
