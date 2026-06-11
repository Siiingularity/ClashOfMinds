import type { Translations } from '@/types';

export const translations: Translations = {
  // Navigation
  home: { ar: 'الرئيسية', en: 'Home' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  contactUs: { ar: 'تواصل معنا', en: 'Contact Us' },
  categories: { ar: 'الفئات', en: 'Categories' },
  howToPlay: { ar: 'كيف العب', en: 'How to Play' },
  myAccount: { ar: 'حسابي', en: 'My Account' },
  myGames: { ar: 'ألعابي', en: 'My Games' },
  store: { ar: 'المتجر', en: 'Store' },
  myPurchases: { ar: 'مشترياتي', en: 'My Purchases' },
  
  // Hero Section
  createGame: { ar: 'إنشاء لعبة', en: 'Create Game' },
  gameDescription: { ar: 'اختبر معلوماتك في تحدي ممتع مع الأصدقاء', en: 'Test your knowledge in a fun challenge with friends' },
  
  // About Section
  aboutGame: { ar: 'نبذة عن اللعبة', en: 'About the Game' },
  aboutDescription: { ar: 'Clash of Minds هي لعبة أسئلة عامة تنافسية تجمع بين المتعة والتحدي.', en: 'Clash of Minds is a competitive trivia game that combines fun and challenge.' },
  
  // Game Setup
  gameSetup: { ar: 'إعداد اللعبة', en: 'Game Setup' },
  sessionName: { ar: 'اسم اللعبة (الجلسة)', en: 'Game Name (Session)' },
  sessionPlaceholder: { ar: 'تحدي المعلومات', en: 'Knowledge Challenge' },
  playerCount: { ar: 'عدد اللاعبين', en: 'Number of Players' },
  team1Name: { ar: 'اسم الفريق الأول', en: 'Team 1 Name' },
  team2Name: { ar: 'اسم الفريق الثاني', en: 'Team 2 Name' },
  selectPowerups: { ar: 'اختر 3 وسائل مساعدة', en: 'Select 3 Power-ups' },
  select3Powerups: { ar: 'يرجى اختيار 3 وسائل مساعدة لكل فريق', en: 'Please select 3 power-ups for each team' },
  team1Time: { ar: 'وقت الإجابة - الفريق الأول', en: 'Answer Time - Team 1' },
  team2Time: { ar: 'وقت الإجابة - الفريق الثاني', en: 'Answer Time - Team 2' },
  next: { ar: 'التالي', en: 'Next' },
  back: { ar: 'رجوع', en: 'Back' },
  startGame: { ar: 'بدء اللعبة', en: 'Start Game' },
  
  // Category Selection
  select6Categories: { ar: 'اختر 6 فئات', en: 'Select 6 Categories' },
  selected: { ar: 'تم الاختيار', en: 'Selected' },
  selectedCategories: { ar: 'الفئات المختارة', en: 'Selected Categories' },
  noCategories: { ar: 'لم تختر أي فئة بعد', en: 'No categories selected yet' },
  select6Cats: { ar: 'يرجى اختيار 6 فئات', en: 'Please select 6 categories' },
  viewAllCategories: { ar: 'عرض جميع الفئات', en: 'View All Categories' },
  
  // Game Screen
  turn: { ar: 'دور', en: 'Turn' },
  exit: { ar: 'خروج', en: 'Exit' },
  endGame: { ar: 'إنهاء اللعبة', en: 'End Game' },
  showAnswer: { ar: 'عرض الإجابة', en: 'Show Answer' },
  correct: { ar: 'صحيحة', en: 'Correct' },
  wrong: { ar: 'خاطئة', en: 'Wrong' },
  whoAnswered: { ar: 'من جاوب؟', en: 'Who answered?' },
  noOne: { ar: 'لا أحد', en: 'No one' },
  timeUp: { ar: 'انتهى الوقت!', en: 'Time is up!' },
  team1TimeUp: { ar: 'انتهى وقت الفريق الأول!', en: 'Team 1 time is up!' },
  team2TimeUp: { ar: 'انتهى وقت الفريق الثاني!', en: 'Team 2 time is up!' },
  saveAndExit: { ar: 'حفظ وخروج', en: 'Save & Exit' },
  exitWithoutSave: { ar: 'خروج بدون حفظ', en: 'Exit Without Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  
  // Results
  winner: { ar: 'الفائز', en: 'Winner' },
  draw: { ar: 'تعادل', en: 'Draw' },
  finalScore: { ar: 'النتيجة النهائية', en: 'Final Score' },
  newGame: { ar: 'لعبة جديدة', en: 'New Game' },
  
  // Auth
  username: { ar: 'اسم المستخدم', en: 'Username' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  haveAccount: { ar: 'لدي حساب بالفعل', en: 'I already have an account' },
  noAccount: { ar: 'ليس لدي حساب', en: "I don't have an account" },
  phone: { ar: 'رقم الجوال', en: 'Phone Number' },
  fillAllFields: { ar: 'يرجى ملء جميع الحقول', en: 'Please fill all fields' },
  passwordsNotMatch: { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords do not match' },
  passwordRequirements: { ar: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل', en: 'Password must be at least 8 characters' },
  passwordWeak: { ar: 'ضعيفة', en: 'Weak' },
  passwordMedium: { ar: 'متوسطة', en: 'Medium' },
  passwordStrong: { ar: 'قوية', en: 'Strong' },
  invalidCredentials: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid credentials' },
  usernameExists: { ar: 'اسم المستخدم موجود بالفعل', en: 'Username already exists' },
  emailExists: { ar: 'البريد الإلكتروني موجود بالفعل', en: 'Email already exists' },
  networkError: { ar: 'خطأ في الاتصال', en: 'Network error' },
  loginSuccess: { ar: 'تم تسجيل الدخول بنجاح', en: 'Login successful' },
  registerSuccess: { ar: 'تم إنشاء الحساب بنجاح', en: 'Registration successful' },
  
  // Contact
  contactTitle: { ar: 'تواصل معنا', en: 'Contact Us' },
  yourName: { ar: 'اسمك', en: 'Your Name' },
  yourEmail: { ar: 'بريدك الإلكتروني', en: 'Your Email' },
  yourPhone: { ar: 'رقم جوالك (اختياري)', en: 'Your Phone (optional)' },
  message: { ar: 'الرسالة', en: 'Message' },
  send: { ar: 'إرسال', en: 'Send' },
  messageSent: { ar: 'تم إرسال الرسالة بنجاح!', en: 'Message sent successfully!' },
  
  // Footer
  allRightsReserved: { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved' },
  
  // Points
  points: { ar: 'نقطة', en: 'points' },
  easy: { ar: 'سهل', en: 'Easy' },
  medium: { ar: 'متوسط', en: 'Medium' },
  hard: { ar: 'صعب', en: 'Hard' },
  
  // Powerups
  powerUps: { ar: 'الوسائل المساعدة', en: 'Power-ups' },
  stealQuestion: { ar: 'سرقة السؤال', en: 'Steal Question' },
  blockOpponent: { ar: 'منع الخصم', en: 'Block Opponent' },
  doublePoints: { ar: 'تدبيل النقاط', en: 'Double Points' },
  callFriend: { ar: 'اتصال بصديق', en: 'Call a Friend' },
  twoAnswers: { ar: 'إجابتين', en: 'Two Answers' },
};

export function t(key: string, lang: 'ar' | 'en'): string {
  return translations[key]?.[lang] || key;
}
