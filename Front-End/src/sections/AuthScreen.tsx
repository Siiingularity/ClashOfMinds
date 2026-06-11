import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { t } from '@/data/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Eye, EyeOff, ArrowLeft, Check, X, Mail, Lock, User, Phone } from 'lucide-react';

interface AuthScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

type TranslationKey = string;

interface FormDataState {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface PasswordStrengthState {
  score: number;
  message: TranslationKey;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

export function AuthScreen({ onBack, onLoginSuccess }: AuthScreenProps) {
  const { language, dir } = useLanguage();
  const { login, startRegister, verifyRegister, resendRegisterOtp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [pendingPhone, setPendingPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthState>({
    score: 0,
    message: '',
  });

  const [error, setError] = useState<TranslationKey>('');
  const [success, setSuccess] = useState<TranslationKey>('');

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let message: TranslationKey = '';
    if (score < 2) message = 'passwordWeak';
    else if (score < 4) message = 'passwordMedium';
    else message = 'passwordStrong';

    setPasswordStrength({ score, message });
    return score;
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));

    if (!isLogin && !isOtpStep) {
      checkPasswordStrength(password);
    }
  };

  const resetStates = () => {
    setError('');
    setSuccess('');
  };

  const resetOtpState = () => {
    setIsOtpStep(false);
    setPendingPhone('');
    setDevOtp('');
    setFormData((prev) => ({ ...prev, otp: '' }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetStates();

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('fillAllFields');
        return;
      }

      try {
        await login(formData.email, formData.password);
        onLoginSuccess();
      } catch (err) {
        setError(getErrorMessage(err, 'loginFailed'));
      }
      return;
    }

    if (!isOtpStep) {
      if (
        !formData.username ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError('fillAllFields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('passwordsNotMatch');
        return;
      }

      if (passwordStrength.score < 3) {
        setError('passwordRequirements');
        return;
      }

      try {
        const response = await startRegister({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        setPendingPhone(formData.phone);
        setIsOtpStep(true);
        setSuccess('verificationCodeSent');

        if (response?.data?.devOtp) {
          setDevOtp(response.data.devOtp);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'registrationFailed'));
      }

      return;
    }

    if (!formData.otp) {
      setError('fillAllFields');
      return;
    }

    try {
      await verifyRegister({
        phone: pendingPhone,
        otp: formData.otp,
      });

      setSuccess('registerSuccess');
      setIsLogin(true);
      resetOtpState();
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: '',
      });
    } catch (err) {
      setError(getErrorMessage(err, 'verificationFailed'));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return 'border-red-500 text-red-500';
    if (passwordStrength.score < 4) return 'border-yellow-500 text-yellow-600';
    return 'border-green-500 text-green-600';
  };

  const handleResendOtp = async () => {
    resetStates();

    try {
      const response = await resendRegisterOtp(pendingPhone);
      setSuccess('verificationCodeSent');

      if (response?.data?.devOtp) {
        setDevOtp(response.data.devOtp);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'verificationFailed'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5D3A1A] font-semibold hover:text-[#8B5A2B] transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png"
              alt="Clash of Minds"
              className="w-56 mx-auto mb-4"
              style={{ filter: 'drop-shadow(0 5px 15px rgba(139, 90, 43, 0.3))' }}
            />
            <h2 className="text-2xl font-bold text-[#5D3A1A]">
              {isLogin
                ? t('login', language)
                : isOtpStep
                ? (language === 'ar' ? 'تفعيل رقم الجوال' : 'Verify Phone')
                : t('register', language)}
            </h2>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <X size={18} />
              <span>{t(error as never, language)}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <Check size={18} />
              <span>{t(success as never, language)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isOtpStep && (
              <div>
                <label className="block text-[#5D3A1A] font-semibold mb-2">
                  {t('username', language)}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, username: e.target.value }))
                    }
                    placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {!isOtpStep && (
              <div>
                <label className="block text-[#5D3A1A] font-semibold mb-2">
                  {isLogin
                    ? language === 'ar'
                      ? 'البريد الإلكتروني أو اسم المستخدم'
                      : 'Email or Username'
                    : language === 'ar'
                    ? 'البريد الإلكتروني'
                    : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder={
                      isLogin
                        ? language === 'ar'
                          ? 'أدخل البريد الإلكتروني أو اسم المستخدم'
                          : 'Enter email or username'
                        : language === 'ar'
                        ? 'أدخل البريد الإلكتروني'
                        : 'Enter email'
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {!isLogin && !isOtpStep && (
              <div>
                <label className="block text-[#5D3A1A] font-semibold mb-2">
                  {language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder={language === 'ar' ? 'أدخل رقم الجوال' : 'Enter phone number'}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {!isOtpStep && (
              <div>
                <label className="block text-[#5D3A1A] font-semibold mb-2">
                  {t('password', language)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      !isLogin && formData.password
                        ? getPasswordStrengthColor()
                        : 'border-gray-200 focus:border-[#8B5A2B]'
                    }`}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength.score
                              ? passwordStrength.score < 2
                                ? 'bg-red-500'
                                : passwordStrength.score < 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${getPasswordStrengthColor()}`}>
                      {t(passwordStrength.message as never, language)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('passwordRequirements', language)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isLogin && !isOtpStep && (
              <div>
                <label className="block text-[#5D3A1A] font-semibold mb-2">
                  {t('confirmPassword', language)}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && isOtpStep && (
              <>
                <div>
                  <label className="block text-[#5D3A1A] font-semibold mb-2">
                    {language === 'ar' ? 'رمز التفعيل' : 'Verification Code'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, otp: e.target.value }))
                      }
                      placeholder={language === 'ar' ? 'أدخل رمز التفعيل' : 'Enter verification code'}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {language === 'ar' ? 'تم إرسال الكود إلى:' : 'Code sent to:'} {pendingPhone}
                </div>

                {devOtp ? (
                  <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                    Dev OTP: {devOtp}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="w-full border-2 border-[#8B5A2B] text-[#8B5A2B] py-3 rounded-xl font-bold hover:bg-[#8B5A2B] hover:text-white transition-all"
                >
                  {language === 'ar' ? 'إعادة إرسال الكود' : 'Resend Code'}
                </button>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              {isLogin
                ? t('login', language)
                : isOtpStep
                ? (language === 'ar' ? 'تفعيل الحساب' : 'Verify Account')
                : (language === 'ar' ? 'إرسال كود التفعيل' : 'Send Verification Code')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                resetStates();
                resetOtpState();
                setFormData({
                  username: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  otp: '',
                });
              }}
              className="text-[#8B5A2B] font-semibold hover:underline"
            >
              {isLogin ? t('noAccount', language) : t('haveAccount', language)}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
