import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { COLORS, GAME_LOGO } from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'Auth'>;
type Mode = 'login' | 'register' | 'otp';

export default function AuthScreen() {
  const navigation = useNavigation<Nav>();
  const { login, startRegister, verifyRegister, resendRegisterOtp, isLoading } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [mode, setMode] = useState<Mode>('login');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [error, setError] = useState('');
  const [hidePw, setHidePw] = useState(true);

  const err = (msg: string) => setError(msg);

  const doLogin = async () => {
    setError('');
    if (!id || !pw) return err(ar ? 'يرجى ملء جميع الحقول' : 'Fill all fields');
    try { await login(id, pw); navigation.goBack(); }
    catch (e: any) { err(e?.message || (ar ? 'فشل تسجيل الدخول' : 'Login failed')); }
  };

  const doRegister = async () => {
    setError('');
    if (!username || !email || !phone || !pw) return err(ar ? 'يرجى ملء جميع الحقول' : 'Fill all fields');
    try { await startRegister({ username, email, phone, password: pw }); setPendingPhone(phone); setMode('otp'); }
    catch (e: any) { err(e?.message || (ar ? 'فشل الإرسال' : 'Failed')); }
  };

  const doOtp = async () => {
    setError('');
    if (!otp) return err(ar ? 'أدخل الرمز' : 'Enter code');
    try {
      await verifyRegister({ phone: pendingPhone, otp });
      Alert.alert(ar ? 'تم!' : 'Done!', ar ? 'تم إنشاء الحساب. سجّل دخولك.' : 'Account created. Please login.', [{ text: 'OK', onPress: () => setMode('login') }]);
    } catch (e: any) { err(e?.message || (ar ? 'رمز خاطئ' : 'Wrong code')); }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>{ar ? '← رجوع' : '← Back'}</Text>
          </TouchableOpacity>

          <Image source={{ uri: GAME_LOGO }} style={s.logo} resizeMode="contain" />

          <View style={s.card}>
            {/* Tabs */}
            {mode !== 'otp' && (
              <View style={s.tabs}>
                {(['login','register'] as Mode[]).map((t) => (
                  <TouchableOpacity key={t} style={[s.tab, mode === t && s.tabActive]} onPress={() => { setMode(t); setError(''); }}>
                    <Text style={[s.tabText, mode === t && s.tabTextActive]}>
                      {t === 'login' ? (ar ? 'دخول' : 'Login') : (ar ? 'تسجيل' : 'Register')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

            {mode === 'login' && <>
              <F label={ar ? 'اسم المستخدم أو البريد' : 'Username or Email'} value={id} onChangeText={setId} autoCapitalize="none" />
              <F label={ar ? 'كلمة المرور' : 'Password'} value={pw} onChangeText={setPw} secureTextEntry={hidePw}
                rightIcon={<TouchableOpacity onPress={() => setHidePw(!hidePw)}><Text style={{ fontSize: 18 }}>{hidePw ? '👁' : '🙈'}</Text></TouchableOpacity>}
              />
              <Btn loading={isLoading} label={ar ? 'تسجيل الدخول' : 'Login'} onPress={doLogin} />
            </>}

            {mode === 'register' && <>
              <F label={ar ? 'اسم المستخدم' : 'Username'} value={username} onChangeText={setUsername} autoCapitalize="none" />
              <F label={ar ? 'البريد الإلكتروني' : 'Email'} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <F label={ar ? 'رقم الجوال' : 'Phone'} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <F label={ar ? 'كلمة المرور' : 'Password'} value={pw} onChangeText={setPw} secureTextEntry={hidePw}
                rightIcon={<TouchableOpacity onPress={() => setHidePw(!hidePw)}><Text style={{ fontSize: 18 }}>{hidePw ? '👁' : '🙈'}</Text></TouchableOpacity>}
              />
              <Btn loading={isLoading} label={ar ? 'إنشاء الحساب' : 'Create Account'} onPress={doRegister} />
            </>}

            {mode === 'otp' && <>
              <View style={s.otpHeader}>
                <Text style={s.otpEmoji}>📱</Text>
                <Text style={s.otpTitle}>{ar ? 'تحقق من رقمك' : 'Verify your phone'}</Text>
                <Text style={s.otpSub}>{ar ? `تم إرسال رمز إلى ${pendingPhone}` : `Code sent to ${pendingPhone}`}</Text>
              </View>
              <F label={ar ? 'رمز التحقق' : 'Verification Code'} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
              <Btn loading={isLoading} label={ar ? 'تحقق' : 'Verify'} onPress={doOtp} />
              <TouchableOpacity style={s.resend} onPress={() => resendRegisterOtp(pendingPhone)}>
                <Text style={s.resendText}>{ar ? 'إعادة إرسال الرمز' : 'Resend code'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={s.linkText}>{ar ? '← رجوع' : '← Back'}</Text>
              </TouchableOpacity>
            </>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function F({ label, rightIcon, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: COLORS.TEXT_MUTED, fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' }}>{label}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput style={[{ backgroundColor: COLORS.BG, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.BROWN_BEIGE, color: COLORS.TEXT_DARK, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }, rightIcon && { paddingRight: 44 }]} placeholderTextColor={COLORS.TEXT_MUTED} {...props} />
        {rightIcon && <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>{rightIcon}</View>}
      </View>
    </View>
  );
}

function Btn({ loading, label, onPress }: any) {
  return (
    <TouchableOpacity style={{ backgroundColor: COLORS.BROWN_PRIMARY, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: COLORS.BROWN_DARKEST, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 }} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{label}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  back: { marginBottom: 4 },
  backText: { color: COLORS.BROWN_ACCENT, fontSize: 14 },
  logo: { width: 200, height: 120, alignSelf: 'center', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: COLORS.BROWN_PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.BG, borderRadius: 12, padding: 3, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.BROWN_PRIMARY },
  tabText: { color: COLORS.TEXT_MUTED, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText: { color: '#dc2626', textAlign: 'center', fontSize: 13 },
  otpHeader: { alignItems: 'center', marginBottom: 16 },
  otpEmoji: { fontSize: 40 },
  otpTitle: { color: COLORS.BROWN_PRIMARY, fontSize: 18, fontWeight: '800', marginTop: 8 },
  otpSub: { color: COLORS.TEXT_MUTED, marginTop: 4, textAlign: 'center' },
  resend: { marginTop: 12, alignItems: 'center' },
  resendText: { color: COLORS.BROWN_ACCENT, textDecorationLine: 'underline' },
  linkText: { color: COLORS.TEXT_MUTED, textAlign: 'center', marginTop: 10 },
});
