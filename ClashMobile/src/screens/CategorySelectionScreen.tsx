import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator, Image, Dimensions, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, Category } from '../types';
import { categoriesAPI, sectionsAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, GAME_LOGO, INFO_ICON, getCategoryImageUri } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'CategorySelection'>;
const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 3;
const CARD_H = CARD_W * (4 / 3); // 3:4 ratio

export default function CategorySelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<{ id: string; name: { ar: string; en: string } }[]>([]);
  const [selected, setSelected] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [catRes, secRes] = await Promise.all([
          categoriesAPI.getAll(),
          sectionsAPI.getAll(),
        ]);
        const cats = ((catRes as any)?.data ?? []).map((c: any) => ({
          id: String(c.id),
          name: { ar: c.name_ar || '', en: c.name_en || '' },
          description: { ar: c.description_ar || '', en: c.description_en || '' },
          section: c.section || 'general',
          image: c.image_url || 'question',
          count: c.actual_question_count ?? c.question_count ?? 0,
          is_active: !!c.is_active,
        }));
        setCategories(cats);

        const apiSecs = ((secRes as any)?.data ?? [])
          .filter((s: any) => s.is_active)
          .map((s: any) => ({ id: s.slug, name: { ar: s.name_ar, en: s.name_en } }));

        const apiSlugs = new Set(apiSecs.map((s: any) => s.id));
        const extraSecs = [...new Set(cats.map((c: any) => c.section))]
          .filter((id) => !apiSlugs.has(id))
          .map((id) => ({ id: String(id), name: { ar: String(id), en: String(id) } }));

        setSections([...apiSecs, ...extraSecs]);
      } catch {
        setError(ar ? 'فشل تحميل الفئات' : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (cat: Category) => {
    setError('');
    if (selected.find((c) => c.id === cat.id)) {
      setSelected(selected.filter((c) => c.id !== cat.id));
    } else if (selected.length >= 6) {
      setError(ar ? 'يمكنك اختيار 6 فئات فقط' : 'You can select up to 6 categories');
    } else {
      setSelected([...selected, cat]);
    }
  };

  const getName = (cat: Category) =>
    typeof cat.name === 'object' ? cat.name[language] : String(cat.name);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadCenter}>
          <Image source={{ uri: GAME_LOGO }} style={s.loadLogo} resizeMode="contain" />
          <ActivityIndicator color={COLORS.BROWN_PRIMARY} size="large" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>{ar ? '← رجوع' : '← Back'}</Text>
        </TouchableOpacity>
        <Image source={{ uri: GAME_LOGO }} style={s.headerLogo} resizeMode="contain" />
        <View style={s.countBadge}>
          <Text style={s.countText}>{selected.length} / 6</Text>
        </View>
      </View>

      <Text style={s.subtitle}>
        {ar ? 'اختر 6 فئات للعب' : 'Select 6 categories to play'}
      </Text>

      {/* Error */}
      {!!error && <View style={s.errorBar}><Text style={s.errorText}>{error}</Text></View>}

      {/* Sections + Categories */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: selected.length > 0 ? 100 : 16 }}>
        {sections.map((sec) => {
          const secCats = categories.filter((c) => (c as any).section === sec.id);
          if (!secCats.length) return null;
          return (
            <View key={sec.id} style={s.section}>
              <Text style={s.sectionTitle}>{sec.name[language]}</Text>
              <View style={s.catGrid}>
                {secCats.map((cat) => {
                  const isSelected = !!selected.find((c) => c.id === cat.id);
                  const imgUri = getCategoryImageUri(cat.image as string);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[s.catCard, isSelected && s.catCardSelected]}
                      onPress={() => toggle(cat)}
                      activeOpacity={0.85}
                    >
                      {/* Full cover image */}
                      <View style={s.catImageContainer}>
                        {imgUri ? (
                          <Image source={{ uri: imgUri }} style={s.catImage} resizeMode="cover" />
                        ) : (
                          <View style={s.catImagePlaceholder}>
                            <Text style={s.catImagePlaceholderText}>❓</Text>
                          </View>
                        )}

                        {/* Selected checkmark */}
                        {isSelected && (
                          <View style={s.checkOverlay}>
                            <Text style={s.checkMark}>✓</Text>
                          </View>
                        )}

                        {/* Name overlay at bottom */}
                        <View style={s.nameOverlay}>
                          <Text style={s.catName} numberOfLines={2}>{getName(cat)}</Text>
                          <Text style={s.catCount}>{(cat as any).count || 6}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom bar */}
      {selected.length > 0 && (
        <View style={s.bottomBar}>
          <Text style={s.selectedInfo}>
            {ar ? `${selected.length} فئات مختارة` : `${selected.length} selected`}
          </Text>
          <TouchableOpacity
            style={[s.nextBtn, selected.length !== 6 && s.nextBtnDisabled]}
            onPress={() => {
              if (selected.length !== 6) {
                setError(ar ? 'يجب اختيار 6 فئات بالضبط' : 'Select exactly 6 categories');
                return;
              }
              navigation.navigate('GameSetup', { categories: selected });
            }}
          >
            <Text style={s.nextBtnText}>
              {selected.length === 6 ? (ar ? 'التالي ←' : 'Next →') : `${selected.length}/6`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  loadCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadLogo: { width: 160, height: 100 },

  header: {
    backgroundColor: COLORS.BROWN_PRIMARY,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  backBtn: { padding: 4 },
  backText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerLogo: { flex: 1, height: 40 },
  countBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  countText: { color: COLORS.BROWN_PRIMARY, fontWeight: '900', fontSize: 14 },

  subtitle: { textAlign: 'center', color: COLORS.BROWN_PRIMARY, fontWeight: '700', fontSize: 15, paddingVertical: 10, backgroundColor: COLORS.BG },

  errorBar: { backgroundColor: '#fee2e2', padding: 8 },
  errorText: { color: '#991b1b', textAlign: 'center', fontWeight: '700' },

  section: { paddingHorizontal: 12, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18, fontWeight: '900', color: COLORS.BROWN_PRIMARY,
    borderBottomWidth: 2, borderBottomColor: COLORS.BROWN_ACCENT,
    paddingBottom: 6, marginBottom: 12,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  catCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  catCardSelected: {
    borderWidth: 3,
    borderColor: COLORS.BROWN_PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  catImageContainer: { flex: 1, position: 'relative' },
  catImage: { width: '100%', height: '100%' },
  catImagePlaceholder: {
    flex: 1, backgroundColor: COLORS.BROWN_BEIGE,
    justifyContent: 'center', alignItems: 'center',
  },
  catImagePlaceholderText: { fontSize: 36 },

  checkOverlay: {
    position: 'absolute', top: 6, left: 6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 2,
  },
  checkMark: { color: '#fff', fontWeight: '900', fontSize: 14 },

  nameOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 8, paddingHorizontal: 6,
  },
  catName: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  catCount: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textAlign: 'center', marginTop: 1 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.BROWN_PRIMARY,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28, gap: 12,
  },
  selectedInfo: { flex: 1, color: '#fff', fontWeight: '700' },
  nextBtn: {
    backgroundColor: COLORS.BROWN_BEIGE, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  nextBtnDisabled: { backgroundColor: COLORS.BROWN_DARK2 },
  nextBtnText: { color: COLORS.BROWN_DARKEST, fontWeight: '900', fontSize: 15 },
});
