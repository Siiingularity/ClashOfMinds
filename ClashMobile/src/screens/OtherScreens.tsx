import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, FlatList, ActivityIndicator, Image, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { categoriesAPI, storeAPI, gamesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { COLORS, GAME_LOGO, POWERUPS, getCategoryImageUri } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList>;

// Shared Header
function H({ onBack, ar }: { onBack: () => void; ar: boolean }) {
  return (
    <View style={sh.header}>
      <TouchableOpacity onPress={onBack}><Text style={sh.back}>{ar ? '← رجوع' : '← Back'}</Text></TouchableOpacity>
      <Image source={{ uri: GAME_LOGO }} style={sh.logo} resizeMode="contain" />
    </View>
  );
}
const sh = StyleSheet.create({
  header: { backgroundColor: COLORS.BROWN_PRIMARY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logo: { flex: 1, height: 36 },
});

// ═══ HOW TO PLAY ═══════════════════════════════════════════════════
export function HowToPlayScreen() {
  const navigation = useNavigation<Nav>();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const steps = [
    { n: 1, icon: '📚', t: { ar: 'اختر الفئات', en: 'Choose Categories' }, d: { ar: 'اختر 6 فئات من الأسئلة المتنوعة', en: 'Choose 6 categories from diverse topics' } },
    { n: 2, icon: '⚙️', t: { ar: 'أعد اللعبة', en: 'Setup' }, d: { ar: 'حدد أسماء الفرق والزمن والباور أبس', en: 'Set team names, time, and power-ups' } },
    { n: 3, icon: '🎮', t: { ar: 'ابدأ اللعب', en: 'Play' }, d: { ar: 'بالتناوب، اختر سؤالاً وأجب عليه', en: 'Take turns picking questions' } },
    { n: 4, icon: '⚡', t: { ar: 'استخدم الباور أبس', en: 'Use Power-Ups' }, d: { ar: 'وقت مناسب يفرق', en: 'Timing is everything' } },
    { n: 5, icon: '🏆', t: { ar: 'الفوز', en: 'Win!' }, d: { ar: 'أكثر نقاط = الفائز', en: 'Most points wins' } },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <H onBack={() => navigation.goBack()} ar={ar} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={g.sectionTitle}>{ar ? 'خطوات اللعب' : 'How to Play'}</Text>
        {steps.map((st) => (
          <View key={st.n} style={g.stepCard}>
            <View style={g.stepNum}><Text style={g.stepNumT}>{st.n}</Text></View>
            <Text style={{ fontSize: 28, marginRight: 10 }}>{st.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={g.stepTitle}>{st.t[language as 'ar'|'en']}</Text>
              <Text style={g.stepDesc}>{st.d[language as 'ar'|'en']}</Text>
            </View>
          </View>
        ))}
        <Text style={[g.sectionTitle, { marginTop: 20 }]}>{ar ? 'وسائل المساعدة' : 'Power-Ups'}</Text>
        <View style={g.puGrid}>
          {Object.entries(POWERUPS).map(([id, pu]) => (
            <View key={id} style={g.puCard}>
              <Image source={{ uri: pu.icon_url }} style={{ width: 44, height: 44, marginBottom: 6 }} />
              <Text style={g.puName}>{pu.name[language as 'ar'|'en']}</Text>
              <Text style={g.puDesc}>{pu.description[language as 'ar'|'en']}</Text>
            </View>
          ))}
        </View>
        <View style={g.ptsCard}>
          <Text style={g.sectionTitle}>{ar ? 'النقاط' : 'Points'}</Text>
          {[[200,'سهل','easy'],[400,'متوسط','medium'],[600,'صعب','hard']].map(([pts,a,e]) => (
            <View key={String(pts)} style={g.ptsRow}>
              <Text style={g.ptsVal}>{pts}</Text>
              <Text style={g.ptsDiff}>{ar ? a : e}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══ CATEGORIES ══════════════════════════════════════════════════
export function CategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await categoriesAPI.getAll(); setCategories((r as any)?.data ?? []); }
      catch {}
      finally { setLoading(false); }
    })();
  }, []);
  const getName = (c: any) => c[`name_${language}`] || c.name_ar || '';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <H onBack={() => navigation.goBack()} ar={ar} />
      {loading ? <ActivityIndicator color={COLORS.BROWN_PRIMARY} style={{ marginTop: 60 }} size="large" /> : (
        <FlatList
          data={categories}
          numColumns={3}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item: cat }) => {
            const uri = getCategoryImageUri(cat.image_url);
            return (
              <View style={g.catCard}>
                {uri ? <Image source={{ uri }} style={g.catImg} resizeMode="cover" /> : <View style={[g.catImg, { backgroundColor: COLORS.BROWN_BEIGE, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ fontSize: 24 }}>❓</Text></View>}
                <View style={g.catOverlay}><Text style={g.catOverlayName} numberOfLines={2}>{getName(cat)}</Text></View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ═══ STORE ═══════════════════════════════════════════════════════
export function StoreScreen() {
  const navigation = useNavigation<Nav>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const ar = language === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await storeAPI.getItems(); setItems((r as any)?.data ?? []); }
      catch {
        setItems([
          { id: 1, name: ar ? '5 ألعاب' : '5 Games', price: 9.99, type: 'games', is_featured: false },
          { id: 2, name: ar ? '20 لعبة' : '20 Games', price: 29.99, original_price: 39.99, type: 'games', is_featured: true },
          { id: 3, name: ar ? 'اشتراك شهري' : 'Monthly Plan', price: 14.99, type: 'subscription', is_featured: false },
        ]);
      }
      finally { setLoading(false); }
    })();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <H onBack={() => navigation.goBack()} ar={ar} />
      {user && (
        <View style={g.balCard}>
          <Text style={g.balLabel}>{ar ? 'ألعابك المتاحة' : 'Available Games'}</Text>
          <Text style={g.balVal}>{user.available_games ?? 0}</Text>
        </View>
      )}
      {loading ? <ActivityIndicator color={COLORS.BROWN_PRIMARY} style={{ marginTop: 60 }} size="large" /> : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={[g.storeCard, item.is_featured && g.storeCardFeatured]}>
              {item.is_featured && <View style={g.featBadge}><Text style={g.featText}>{ar ? '⭐ الأفضل قيمة' : '⭐ Best Value'}</Text></View>}
              <View style={g.storeBody}>
                <View>
                  <Text style={g.storeItemName}>{item.name}</Text>
                  <Text style={g.storeItemType}>{item.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {item.original_price && <Text style={g.origPrice}>${item.original_price}</Text>}
                  <Text style={g.price}>${item.price}</Text>
                  <TouchableOpacity style={g.buyBtn} onPress={() => { if (!user) navigation.navigate('Auth'); else Alert.alert(ar ? 'قريباً' : 'Coming Soon', ''); }}>
                    <Text style={g.buyBtnText}>{ar ? 'شراء' : 'Buy'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ═══ DASHBOARD ═══════════════════════════════════════════════════
export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await gamesAPI.getDashboardStats(); setStats((r as any)?.data); }
      catch {}
      finally { setLoading(false); }
    })();
  }, []);
  if (user?.role !== 'admin' && user?.role !== 'editor') return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <Text style={{ color: COLORS.BROWN_PRIMARY, textAlign: 'center', marginTop: 100 }}>{ar ? 'غير مصرح' : 'Unauthorized'}</Text>
    </SafeAreaView>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <H onBack={() => navigation.goBack()} ar={ar} />
      {loading ? <ActivityIndicator color={COLORS.BROWN_PRIMARY} style={{ marginTop: 60 }} size="large" /> : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {stats && (
            <View style={g.statsGrid}>
              {[['👥',ar?'المستخدمون':'Users',stats.totalUsers??0],['📚',ar?'الفئات':'Categories',stats.totalCategories??0],['❓',ar?'الأسئلة':'Questions',stats.totalQuestions??0],['💰',ar?'المبيعات':'Purchases',stats.totalPurchases??0],['🎮',ar?'الألعاب':'Games',stats.activeGames??0],['📈',ar?'الإيراد':'Revenue',`$${stats.totalRevenue??0}`]].map(([icon,lbl,val]) => (
                <View key={String(lbl)} style={g.statCard}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
                  <Text style={g.statCardVal}>{val}</Text>
                  <Text style={g.statCardLbl}>{String(lbl)}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={g.webLinkCard}>
            <Text style={g.webLinkTitle}>{ar ? 'للإدارة الكاملة' : 'For full management'}</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://clashofminds.net/dashboard')}>
              <Text style={g.webLink}>{ar ? '🌐 فتح لوحة الويب' : '🌐 Open web dashboard'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ═══ DRAWING ═════════════════════════════════════════════════════
export function DrawingScreen() {
  const navigation = useNavigation<Nav>();
  const { language } = useLanguage();
  const ar = language === 'ar';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BG }}>
      <H onBack={() => navigation.goBack()} ar={ar} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🎨</Text>
        <Text style={{ color: COLORS.BROWN_PRIMARY, fontSize: 22, fontWeight: '900', marginBottom: 8 }}>{ar ? 'لعبة الرسم' : 'Drawing Game'}</Text>
        <Text style={{ color: COLORS.TEXT_MUTED, textAlign: 'center', lineHeight: 22 }}>
          {ar ? 'ارسم ما يظهر لك على شاشة اللعبة!' : 'Draw what appears on the game screen!'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default HowToPlayScreen;
export { HowToPlayScreen as HowToPlay, CategoriesScreen as Categories, StoreScreen as Store, DashboardScreen as Dashboard, DrawingScreen as Drawing };

const g = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.BROWN_PRIMARY, borderBottomWidth: 2, borderBottomColor: COLORS.BROWN_ACCENT, paddingBottom: 6, marginBottom: 12 },
  stepCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.BROWN_PRIMARY, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepNumT: { color: '#fff', fontWeight: '900', fontSize: 13 },
  stepTitle: { color: COLORS.BROWN_PRIMARY, fontWeight: '800', fontSize: 14, marginBottom: 2 },
  stepDesc: { color: COLORS.TEXT_MUTED, fontSize: 12 },
  puGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  puCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  puName: { color: COLORS.BROWN_PRIMARY, fontWeight: '800', fontSize: 12, textAlign: 'center', marginBottom: 3 },
  puDesc: { color: COLORS.TEXT_MUTED, fontSize: 10, textAlign: 'center' },
  ptsCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  ptsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.BG },
  ptsVal: { color: COLORS.BROWN_ACCENT, fontWeight: '900', fontSize: 22, width: 60 },
  ptsDiff: { color: COLORS.TEXT_MUTED, fontSize: 14 },
  catCard: { flex: 1, aspectRatio: 3/4, borderRadius: 12, overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },
  catImg: { width: '100%', height: '100%' },
  catOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6 },
  catOverlayName: { color: '#fff', fontSize: 10, fontWeight: '800', textAlign: 'center' },
  balCard: { margin: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  balLabel: { color: COLORS.BROWN_PRIMARY, fontWeight: '700' },
  balVal: { color: COLORS.BROWN_ACCENT, fontWeight: '900', fontSize: 24 },
  storeCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  storeCardFeatured: { borderWidth: 2, borderColor: COLORS.BROWN_ACCENT },
  featBadge: { backgroundColor: COLORS.BROWN_BEIGE, paddingVertical: 6, paddingHorizontal: 12 },
  featText: { color: COLORS.BROWN_DARKEST, fontWeight: '700', fontSize: 12 },
  storeBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  storeItemName: { color: COLORS.BROWN_PRIMARY, fontWeight: '800', fontSize: 15 },
  storeItemType: { color: COLORS.TEXT_MUTED, fontSize: 12, textTransform: 'capitalize', marginTop: 2 },
  origPrice: { color: COLORS.TEXT_MUTED, fontSize: 12, textDecorationLine: 'line-through' },
  price: { color: COLORS.BROWN_ACCENT, fontWeight: '900', fontSize: 22 },
  buyBtn: { backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  buyBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '30.5%', backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  statCardVal: { color: COLORS.BROWN_ACCENT, fontWeight: '900', fontSize: 20 },
  statCardLbl: { color: COLORS.TEXT_MUTED, fontSize: 11, textAlign: 'center', marginTop: 2 },
  webLinkCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  webLinkTitle: { color: COLORS.TEXT_MUTED, marginBottom: 8 },
  webLink: { color: COLORS.BROWN_ACCENT, fontWeight: '700', fontSize: 15 },
});
