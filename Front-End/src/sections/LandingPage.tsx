import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Footer } from '@/components/Footer';
import { Modal } from '@/components/Modal';
import { powerUps } from '@/data/categories';
import { categoriesAPI } from '@/services/api';
import { mapApiCategoryToUi } from '@/lib/categoryMapper';
import type { Category } from '@/types';
import { HelpCircle, Zap, Gamepad2, ChevronDown, LogIn, MessageCircle, Grid3X3, User, BookOpen, Send, ShoppingCart, LayoutDashboard } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onCreateGameClick: () => void;
  user: { username: string; role?: string } | null;
  onLogout: () => void;
  onAccountClick: () => void;
  onHowToPlayClick: () => void;
  onCategoriesClick: () => void;
  onStoreClick?: () => void;
  onDashboardClick?: () => void;
  hasSavedGame?: boolean;
}

export function LandingPage({ 
  onLoginClick, 
  onCreateGameClick, 
  user, 
  onLogout, 
  onAccountClick, 
  onHowToPlayClick, 
  onCategoriesClick,
  onStoreClick,
  onDashboardClick
}: LandingPageProps) {
  const { language, dir } = useLanguage();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPowerupsModal, setShowPowerupsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const accountRef = useRef<HTMLDivElement>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Load categories from database for home page
useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories((res.data || []).map(mapApiCategoryToUi));
    } catch (error) {
      console.error('Failed to load categories on landing page:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  loadCategories();
}, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form:', contactForm);
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setShowContactModal(false);
    }, 2000);
  };

  // Get categories for display from database
  const displayCategories = categories.slice(0, 12);

  return (
    <div className="min-h-screen" dir={dir}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-[#5D3A1A] font-bold text-lg hover:text-[#8B5A2B] transition-colors"
            >
              {t('home', language)}
            </button>
            <button 
              onClick={onHowToPlayClick}
              className="text-[#5D3A1A] font-semibold hover:text-[#8B5A2B] transition-colors flex items-center gap-1"
            >
              <BookOpen size={18} />
              {t('howToPlay', language)}
            </button>
            <button 
              onClick={onCategoriesClick}
              className="text-[#5D3A1A] font-semibold hover:text-[#8B5A2B] transition-colors flex items-center gap-1"
            >
              <Grid3X3 size={18} />
              {t('categories', language)}
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="text-[#5D3A1A] font-semibold hover:text-[#8B5A2B] transition-colors flex items-center gap-1"
            >
              <MessageCircle size={18} />
              {t('contactUs', language)}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user ? (
              <div className="relative" ref={accountRef}>
                <button 
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="bg-[#8B5A2B] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#5D3A1A] transition-colors flex items-center gap-2"
                >
                  <User size={18} />
                  {t('myAccount', language)}
                  <ChevronDown size={16} className={`transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {accountMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button 
                      onClick={() => { onAccountClick(); setAccountMenuOpen(false); }}
                      className="w-full px-4 py-3 text-right hover:bg-[#F5E6D3] transition-colors flex items-center gap-2"
                    >
                      <User size={18} className="text-[#8B5A2B]" />
                      {t('myAccount', language)}
                    </button>
                    <button 
                      onClick={() => { onAccountClick(); setAccountMenuOpen(false); }}
                      className="w-full px-4 py-3 text-right hover:bg-[#F5E6D3] transition-colors flex items-center gap-2"
                    >
                      <Gamepad2 size={18} className="text-[#8B5A2B]" />
                      {t('myGames', language)}
                    </button>
                    {onStoreClick && (
                      <button 
                        onClick={() => { onStoreClick(); setAccountMenuOpen(false); }}
                        className="w-full px-4 py-3 text-right hover:bg-[#F5E6D3] transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={18} className="text-[#8B5A2B]" />
                        {t('store', language)}
                      </button>
                    )}
                    {onDashboardClick && (
                      <button 
                        onClick={() => { onDashboardClick(); setAccountMenuOpen(false); }}
                        className="w-full px-4 py-3 text-right hover:bg-[#F5E6D3] transition-colors flex items-center gap-2"
                      >
                        <LayoutDashboard size={18} className="text-[#8B5A2B]" />
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </button>
                    )}
                    <button 
                      onClick={() => { onAccountClick(); setAccountMenuOpen(false); }}
                      className="w-full px-4 py-3 text-right hover:bg-[#F5E6D3] transition-colors flex items-center gap-2"
                    >
                      <MessageCircle size={18} className="text-[#8B5A2B]" />
                      {t('myPurchases', language)}
                    </button>
                    <hr className="border-gray-100" />
                    <button 
                      onClick={() => { onLogout(); setAccountMenuOpen(false); }}
                      className="w-full px-4 py-3 text-right hover:bg-red-50 text-red-500 transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      {t('logout', language)}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="bg-[#8B5A2B] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#5D3A1A] transition-colors flex items-center gap-2"
              >
                <LogIn size={18} />
                {t('login', language)}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Image */}
          <div className="mb-8">
            <img 
              src="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png" 
              alt="Clash of Minds" 
              className="w-44 md:w-64 lg:w-[350px] mx-auto animate-float"
              style={{ filter: 'drop-shadow(0 15px 40px rgba(139, 90, 43, 0.5))' }}
            />
          </div>
          
          <p className="text-xl md:text-2xl text-[#5D3A1A] mb-10 font-medium" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
            {language === 'ar' 
              ? 'أفضل لعبة ثقافية مناسبة للجميع'
              : 'The best trivia game suitable for everyone'}
          </p>
          
          <button 
            onClick={onCreateGameClick}
            className="bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white text-xl px-12 py-5 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <Gamepad2 size={28} />
            {t('createGame', language)}
          </button>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown size={32} className="text-[#8B5A2B]" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About Game */}
            <div 
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2"
              onClick={() => setShowAboutModal(true)}
            >
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle size={32} className="text-[#8B5A2B]" />
              </div>
              <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4">{t('aboutGame', language)}</h3>
              <p className="text-gray-600">{t('aboutDescription', language)}</p>
            </div>
            
            {/* How to Play */}
            <div 
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2"
              onClick={onHowToPlayClick}
            >
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-[#8B5A2B]" />
              </div>
              <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4">{t('howToPlay', language)}</h3>
              <p className="text-gray-600">
                {language === 'ar' 
                  ? 'تعلم كيفية اللعب ووسائل المساعدة'
                  : 'Learn how to play and use power-ups'}
              </p>
            </div>
            
            {/* PowerUps */}
            <div 
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2"
              onClick={() => setShowPowerupsModal(true)}
            >
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={32} className="text-[#8B5A2B]" />
              </div>
              <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4">{t('powerUps', language)}</h3>
              <p className="text-gray-600">
                {language === 'ar'
                  ? 'اكتشف وسائل المساعدة للفوز'
                  : 'Discover power-ups to win'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview Section - Modern Design */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#5D3A1A] text-center mb-4">
            {t('categories', language)}
          </h2>
          <p className="text-center text-[#8B5A2B] mb-12 text-lg">
            {language === 'ar' ? 'اختر من مجموعة واسعة من الفئات الممتعة' : 'Choose from a wide variety of fun categories'}
          </p>
          
          {/* Mixed categories grid - modern design */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {displayCategories.map((cat) => (
              <div 
                key={cat.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                style={{ aspectRatio: '9/16' }}
              >
                {/* Image Container with Hover Effect */}
                <div className="h-full w-full relative overflow-hidden">
                  {cat.image === 'question' ? (
                    <div className="h-full w-full bg-gradient-to-br from-[#8B5A2B] via-[#A67B5B] to-[#C49A6C] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <HelpCircle size={50} className="text-white/80" />
                    </div>
                  ) : (
                    <img 
                      src={cat.image} 
                      alt={cat.name[language]} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  
                  {/* Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
                </div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-16">
                  <p className="text-white text-center font-bold text-sm md:text-base truncate drop-shadow-lg">
                    {cat.name[language]}
                  </p>
                </div>
                
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 30px rgba(139, 90, 43, 0.3)' }}
                ></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={onCategoriesClick}
              className="bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {language === 'ar'
                ? `عرض جميع الفئات (${categoriesLoading ? '...' : categories.length})`
                : `View all categories (${categoriesLoading ? '...' : categories.length})`}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <Modal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)}
        title={t('aboutGame', language)}
        icon="🎮"
      >
        <p className="text-lg leading-relaxed">{t('aboutDescription', language)}</p>
      </Modal>

      <Modal 
        isOpen={showPowerupsModal} 
        onClose={() => setShowPowerupsModal(false)}
        title={t('powerUps', language)}
        icon="⚡"
      >
        <div className="space-y-4">
          {powerUps.map((power) => (
            <div key={power.id} className="flex items-start gap-4 bg-[#F5E6D3] p-4 rounded-xl">
              <img src={power.icon} alt="" className="w-12 h-12" />
              <div>
                <h4 className="font-bold text-[#5D3A1A]">{power.name[language]}</h4>
                <p className="text-gray-600 text-sm">{power.description[language]}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)}
        title={t('contactTitle', language)}
        icon="📧"
      >
        {contactSent ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-white" />
            </div>
            <p className="text-xl font-bold text-[#5D3A1A]">{t('messageSent', language)}</p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-[#5D3A1A] font-bold mb-2">{t('yourName', language)}</label>
              <input 
                type="text" 
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#5D3A1A] font-bold mb-2">{t('yourEmail', language)}</label>
              <input 
                type="email" 
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#5D3A1A] font-bold mb-2">{t('yourPhone', language)}</label>
              <input 
                type="tel" 
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#5D3A1A] font-bold mb-2">{t('message', language)}</label>
              <textarea 
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none"
                rows={4}
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full p-4 bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {t('send', language)}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
