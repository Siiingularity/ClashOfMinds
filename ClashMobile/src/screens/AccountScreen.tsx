import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { authAPI } from '../services/api';
import { COLORS, GAME_LOGO } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Account'>;
export default function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [tab, setTab] = useState<'profile'|'password'>('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ username, email });
      Alert.alert(ar ? 'تم' : 'Saved', ar ? 'تم تحديث الملف الشخصي' : 'Profile updated');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const changePw = async () => {
    if (!cur || !nw) return;
    setSaving(true);
    try {
      await authAPI.changePassword(cur, nw);
      Alert.alert(ar ? 'تم' : 'Done', ar ? 'تم تغيير كلمة المرور' : 'Password changed');
      setCur(''); setNw('');
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (!user) return (
    <SafeAreaView style={s.container}>
      <Text style={{ color: COLORS.BROWN_PRIMARY, textAlign: 'center', marginTop: 100 }}>
        {ar ? 'يرجى تسجيل الدخول' : 'Please login first'}
      </Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>{ar ? '← رجوع' : '← Back'}</Text></TouchableOpacity>
        <Image source={{ uri: GAME_LOGO }} style={s.headerLogo} resizeMode="contain" />
        <TouchableOpacity onPress={logout}><Text style={s.logoutTxt}>{ar ? 'خروج' : 'Logout'}</Text></TouchableOpacity>
      </View>

      <View style={s.avatarSection}>
        <View style={s.avatar}><Text style={s.avatarChar}>{user.username.charAt(0).toUpperCase()}</Text></View>
        <Text style={s.uname}>{user.username}</Text>
        <View style={s.roleBadge}><Text style={s.roleText}>{user.role}</Text></View>
      </View>

      <View style={s.stats}>
        {[{l: ar ? 'ألعاب' : 'Games', v: user.games_played ?? 0}, {l: ar ? 'انتصارات' : 'Wins', v: user.games_won ?? 0}, {l: ar ? 'نقاط' : 'Score', v: user.total_score ?? 0}].map((st) => (
          <View key={st.l} style={s.statItem}>
            <Text style={s.statVal}>{st.v}</Text>
            <Text style={s.statLbl}>{st.l}</Text>
          </View>
        ))}
      </View>

      <View style={s.tabs}>
        {(['profile','password'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t === 'profile' ? (ar ? 'الملف' : 'Profile') : (ar ? 'كلمة السر' : 'Password')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {tab === 'profile' ? <>
          <L t={ar ? 'اسم المستخدم' : 'Username'} /><I value={username} onChangeText={setUsername} />
          <L t={ar ? 'البريد الإلكتروني' : 'Email'} /><I value={email} onChangeText={setEmail} keyboardType="email-address" />
          <L t={ar ? 'الجوال' : 'Phone'} /><I value={user.phone || ''} editable={false} />
          <SB saving={saving} onPress={save} ar={ar} />
        </> : <>
          <L t={ar ? 'كلمة المرور الحالية' : 'Current Password'} /><I value={cur} onChangeText={setCur} secureTextEntry />
          <L t={ar ? 'كلمة المرور الجديدة' : 'New Password'} /><I value={nw} onChangeText={setNw} secureTextEntry />
          <SB saving={saving} onPress={changePw} ar={ar} />
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}
const L = ({ t }: { t: string }) => <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 6, textTransform: 'uppercase' }}>{t}</Text>;
const I = (p: any) => <TextInput style={{ backgroundColor: COLORS.BG, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.BROWN_BEIGE, color: COLORS.TEXT_DARK, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 }} placeholderTextColor={COLORS.TEXT_MUTED} {...p} />;
const SB = ({ saving, onPress, ar }: any) => (
  <TouchableOpacity style={{ backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 }} onPress={onPress} disabled={saving}>
    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{ar ? 'حفظ التغييرات' : 'Save Changes'}</Text>}
  </TouchableOpacity>
);
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  header: { backgroundColor: COLORS.BROWN_PRIMARY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { color: '#fff', fontSize: 15 },
  headerLogo: { flex: 1, height: 36 },
  logoutTxt: { color: '#fca5a5', fontWeight: '700', fontSize: 14 },
  avatarSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.BROWN_ACCENT, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarChar: { color: '#fff', fontSize: 32, fontWeight: '900' },
  uname: { color: COLORS.BROWN_PRIMARY, fontSize: 20, fontWeight: '800' },
  roleBadge: { backgroundColor: COLORS.BROWN_BEIGE, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
  roleText: { color: COLORS.BROWN_DARKEST, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  stats: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.BG },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: COLORS.BG },
  statVal: { color: COLORS.BROWN_ACCENT, fontSize: 22, fontWeight: '900' },
  statLbl: { color: COLORS.TEXT_MUTED, fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: COLORS.BG, borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.BROWN_PRIMARY },
  tabTxt: { color: COLORS.TEXT_MUTED, fontWeight: '700' },
  tabTxtActive: { color: '#fff' },
});
