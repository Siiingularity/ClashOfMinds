import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, SafeAreaView, StatusBar, Dimensions, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { storage } from '../utils/storage';
import { COLORS, GAME_LOGO } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Landing'>;
const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const ar = language === 'ar';

  useEffect(() => {
    (async () => {
      const saved = await storage.getJSON<any>('savedGame');
      if (saved && Date.now() - saved.timestamp < 24 * 60 * 60 * 1000) setHasSavedGame(true);
    })();
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  const handlePlay = () => {
    if (!user) navigation.navigate('Auth');
    else navigation.navigate('CategorySelection');
  };

  const handleLogout = () =>
    Alert.alert(
      ar ? 'تسجيل الخروج' : 'Logout',
      ar ? 'هل تريد تسجيل الخروج؟' : 'Are you sure?',
      [{ text: ar ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: ar ? 'خروج' : 'Logout', onPress: logout }]
    );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.BG} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.langBtn} onPress={() => setLanguage(ar ? 'en' : 'ar')}>
            <Text style={s.langBtnText}>{ar ? 'EN' : 'عر'}</Text>
          </TouchableOpacity>
          {user ? (
            <View style={s.userArea}>
              <Text style={s.userNameTop}>{user.username}</Text>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={s.logoutSmall}>{ar ? 'خروج' : 'Logout'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.loginTopBtn} onPress={() => navigation.navigate('Auth')}>
              <Text style={s.loginTopText}>{ar ? 'دخول' : 'Login'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logo */}
        <View style={s.logoSection}>
          <Image source={{ uri: GAME_LOGO }} style={s.logo} resizeMode="contain" />
          <Text style={s.tagline}>
            {ar ? 'أفضل لعبة ثقافية مناسبة للجميع' : 'The best trivia game for everyone'}
          </Text>
        </View>

        {/* Saved game */}
        {hasSavedGame && (
          <View style={s.savedBanner}>
            <Text style={s.savedText}>
              {ar ? '💾 يوجد لعبة محفوظة' : '💾 Saved game found'}
            </Text>
          </View>
        )}

        {/* Main play button */}
        <TouchableOpacity style={s.playBtn} onPress={handlePlay} activeOpacity={0.85}>
          <Text style={s.playBtnText}>
            🎮  {ar ? 'ابدأ لعبة جديدة' : 'Start New Game'}
          </Text>
        </TouchableOpacity>

        {/* Cards grid */}
        <View style={s.grid}>
          <Card icon="📚" label={ar ? 'الفئات' : 'Categories'} onPress={() => navigation.navigate('Categories')} />
          <Card icon="❓" label={ar ? 'كيف تلعب' : 'How to Play'} onPress={() => navigation.navigate('HowToPlay')} />
          <Card icon="🛒" label={ar ? 'المتجر' : 'Store'} onPress={() => navigation.navigate('Store')} />
          {user
            ? <Card icon="👤" label={ar ? 'حسابي' : 'Account'} onPress={() => navigation.navigate('Account')} />
            : <Card icon="🔐" label={ar ? 'تسجيل دخول' : 'Login'} onPress={() => navigation.navigate('Auth')} />
          }
          {isAdmin && <Card icon="⚙️" label={ar ? 'لوحة التحكم' : 'Dashboard'} onPress={() => navigation.navigate('Dashboard')} accent />}
        </View>

        <Text style={s.footer}>Clash of Minds © 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ icon, label, onPress, accent }: { icon: string; label: string; onPress: () => void; accent?: boolean }) {
  return (
    <TouchableOpacity style={[s.card, accent && s.cardAccent]} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.cardIcon}>{icon}</Text>
      <Text style={[s.cardLabel, accent && s.cardLabelAccent]}>{label}</Text>
    </TouchableOpacity>
  );
}

const CARD_W = (width - 48) / 2;
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  scroll: { paddingBottom: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12 },
  langBtn: { backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  langBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  userArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userNameTop: { color: COLORS.BROWN_PRIMARY, fontWeight: '700', fontSize: 14 },
  logoutSmall: { color: COLORS.BROWN_ACCENT, fontSize: 13, textDecorationLine: 'underline' },
  loginTopBtn: { backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  loginTopText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  logoSection: { alignItems: 'center', paddingVertical: 28 },
  logo: { width: width * 0.65, height: width * 0.42 },
  tagline: { color: COLORS.BROWN_PRIMARY, fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  savedBanner: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fef3c7', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#fcd34d' },
  savedText: { color: '#92400e', textAlign: 'center', fontWeight: '700', fontSize: 13 },

  playBtn: {
    marginHorizontal: 16, backgroundColor: COLORS.BROWN_PRIMARY,
    borderRadius: 18, paddingVertical: 18,
    shadowColor: COLORS.BROWN_DARKEST, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  playBtnText: { color: '#fff', textAlign: 'center', fontSize: 20, fontWeight: '900' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, marginTop: 8 },
  card: { width: CARD_W, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: COLORS.BROWN_ACCENT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  cardAccent: { backgroundColor: COLORS.BROWN_BEIGE },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { color: COLORS.BROWN_PRIMARY, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  cardLabelAccent: { color: COLORS.BROWN_DARKEST },

  footer: { textAlign: 'center', color: COLORS.TEXT_MUTED, fontSize: 12, marginTop: 16 },
});
