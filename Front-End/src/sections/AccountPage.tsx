import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, User as UserIcon, Gamepad2, ShoppingBag, Package, LogOut, Play, RotateCcw } from 'lucide-react';
import type { User } from '@/types';

interface AccountPageProps {
  user: User;
  onBack: () => void;
  onResumeGame: () => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'games' | 'store' | 'purchases';

export function AccountPage({ user, onBack, onResumeGame, onLogout }: AccountPageProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const savedGame = localStorage.getItem('savedGame');
  const hasSavedGame = !!savedGame;

  const tabs = [
    { id: 'profile' as Tab, label: language === 'ar' ? 'حسابي' : 'My Account', icon: UserIcon },
    { id: 'games' as Tab, label: language === 'ar' ? 'ألعابي' : 'My Games', icon: Gamepad2 },
    { id: 'store' as Tab, label: language === 'ar' ? 'المتجر' : 'Store', icon: ShoppingBag },
    { id: 'purchases' as Tab, label: language === 'ar' ? 'مشترياتي' : 'My Purchases', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          
          <img 
            src="https://i.imgur.com/bOiiY4V.png" 
            alt="Clash of Minds" 
            className="w-40 md:w-52"
          />
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            {language === 'ar' ? 'خروج' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white'
                      : 'bg-white text-[#5D3A1A] hover:bg-[#F5E6D3]'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#5D3A1A] mb-6">
                  {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
                </h2>
                
                <div className="flex items-center justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] rounded-full flex items-center justify-center">
                    <UserIcon size={48} className="text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#F5E6D3] rounded-xl p-4">
                    <label className="text-[#8B5A2B] font-semibold text-sm">
                      {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                    </label>
                    <p className="text-[#5D3A1A] text-xl font-bold">{user.username}</p>
                  </div>

                  <div className="bg-[#F5E6D3] rounded-xl p-4">
                    <label className="text-[#8B5A2B] font-semibold text-sm">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <p className="text-[#5D3A1A] text-xl font-bold">{user.email}</p>
                  </div>

                  <div className="bg-[#F5E6D3] rounded-xl p-4">
                    <label className="text-[#8B5A2B] font-semibold text-sm">
                      {language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                    </label>
                    <p className="text-[#5D3A1A] text-xl font-bold">
                      {language === 'ar' ? 'غير محدد' : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#5D3A1A] mb-6">
                  {language === 'ar' ? 'ألعابي' : 'My Games'}
                </h2>

                {hasSavedGame ? (
                  <div className="bg-[#F5E6D3] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#5D3A1A]">
                          {language === 'ar' ? 'لعبة محفوظة' : 'Saved Game'}
                        </h3>
                        <p className="text-[#8B5A2B]">
                          {language === 'ar' ? 'لديك لعبة غير منتهية' : 'You have an unfinished game'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={onResumeGame}
                        className="flex-1 bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Play size={20} />
                        {language === 'ar' ? 'استكمال اللعبة' : 'Resume Game'}
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('savedGame');
                          window.location.reload();
                        }}
                        className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all"
                      >
                        <RotateCcw size={20} />
                        {language === 'ar' ? 'إعادة' : 'Restart'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gamepad2 size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {language === 'ar' ? 'لا توجد ألعاب محفوظة' : 'No saved games'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#5D3A1A] mb-6">
                  {language === 'ar' ? 'المتجر' : 'Store'}
                </h2>
                <div className="text-center py-12">
                  <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {language === 'ar' ? 'قريباً...' : 'Coming soon...'}
                  </p>
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#5D3A1A] mb-6">
                  {language === 'ar' ? 'مشترياتي' : 'My Purchases'}
                </h2>
                <div className="text-center py-12">
                  <Package size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {language === 'ar' ? 'لا توجد مشتريات' : 'No purchases'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
