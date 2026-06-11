import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, { ar: string; en: string }> = {
  // Auth
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  phone: { ar: 'رقم الجوال', en: 'Phone' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  // Navigation
  home: { ar: 'الرئيسية', en: 'Home' },
  categories: { ar: 'الفئات', en: 'Categories' },
  store: { ar: 'المتجر', en: 'Store' },
  account: { ar: 'الحساب', en: 'Account' },
  howToPlay: { ar: 'كيفية اللعب', en: 'How to Play' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  // Game
  play: { ar: 'العب', en: 'Play' },
  newGame: { ar: 'لعبة جديدة', en: 'New Game' },
  team1: { ar: 'الفريق الأول', en: 'Team 1' },
  team2: { ar: 'الفريق الثاني', en: 'Team 2' },
  score: { ar: 'النتيجة', en: 'Score' },
  points: { ar: 'نقاط', en: 'Points' },
  correct: { ar: 'صحيح', en: 'Correct' },
  wrong: { ar: 'خطأ', en: 'Wrong' },
  showAnswer: { ar: 'عرض الإجابة', en: 'Show Answer' },
  nextTurn: { ar: 'الدور التالي', en: 'Next Turn' },
  endGame: { ar: 'إنهاء اللعبة', en: 'End Game' },
  winner: { ar: 'الفائز', en: 'Winner' },
  draw: { ar: 'تعادل', en: 'Draw' },
  selectCategories: { ar: 'اختر الفئات', en: 'Select Categories' },
  setupGame: { ar: 'إعداد اللعبة', en: 'Game Setup' },
  teamName: { ar: 'اسم الفريق', en: 'Team Name' },
  powerups: { ar: 'الباور أبس', en: 'Power-Ups' },
  startGame: { ar: 'ابدأ اللعبة', en: 'Start Game' },
  question: { ar: 'السؤال', en: 'Question' },
  answer: { ar: 'الإجابة', en: 'Answer' },
  yourTurn: { ar: 'دورك', en: 'Your Turn' },
  // Results
  congratulations: { ar: 'تهانينا', en: 'Congratulations' },
  playAgain: { ar: 'العب مجدداً', en: 'Play Again' },
  backToHome: { ar: 'العودة للرئيسية', en: 'Back to Home' },
  // Common
  loading: { ar: 'جار التحميل...', en: 'Loading...' },
  error: { ar: 'خطأ', en: 'Error' },
  back: { ar: 'رجوع', en: 'Back' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  save: { ar: 'حفظ', en: 'Save' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  search: { ar: 'بحث', en: 'Search' },
  noData: { ar: 'لا توجد بيانات', en: 'No data available' },
  close: { ar: 'إغلاق', en: 'Close' },
  report: { ar: 'تبليغ', en: 'Report' },
  send: { ar: 'إرسال', en: 'Send' },
  pause: { ar: 'إيقاف مؤقت', en: 'Pause' },
  resume: { ar: 'استئناف', en: 'Resume' },
  exitGame: { ar: 'الخروج من اللعبة', en: 'Exit Game' },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
