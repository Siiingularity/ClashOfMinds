import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { allCategories, categorySections, gameLogo, infoIcon } from '@/data/categories';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface CategoriesPageProps {
  onBack: () => void;
}

export function CategoriesPage({ onBack }: CategoriesPageProps) {
  const { language, dir } = useLanguage();
  const [showInfo, setShowInfo] = useState<typeof allCategories[0] | null>(null);
  
  const sections = Object.values(categorySections);

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              {language === 'ar' ? 'رجوع' : 'Back'}
            </button>
            <LanguageSelector />
          </div>
          
          <div className="text-center">
            <img 
              src={gameLogo}
              alt="Clash of Minds" 
              className="w-32 md:w-48 mx-auto mb-4"
            />
            <h2 className="text-2xl md:text-3xl font-bold">{t('categories', language)}</h2>
            <p className="text-white/80 mt-2">
              {language === 'ar' 
                ? `إجمالي الفئات: ${allCategories.length}` 
                : `Total categories: ${allCategories.length}`}
            </p>
          </div>
        </div>
      </header>

      {/* Categories by Section - Modern Design */}
      <main className="flex-1 p-4 md:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-16">
          {sections.map((section) => {
            const sectionCategories = allCategories.filter(cat => cat.section === section.id);
            if (sectionCategories.length === 0) return null;
            
            return (
              <div key={section.id} className="space-y-8">
                <h3 className="text-3xl md:text-4xl font-bold text-[#5D3A1A] relative pb-4">
                  {section.name[language]}
                  <span className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-l from-[#8B5A2B] to-transparent rounded-full"></span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  {sectionCategories.map((category) => (
                    <div
                      key={category.id}
                      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                      style={{ aspectRatio: '9/16' }}
                    >
                      {/* Info Button */}
                      <button
                        onClick={() => setShowInfo(category)}
                        className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg hover:scale-110"
                        title=""
                      >
                        <img src={infoIcon} alt="info" className="w-5 h-5" />
                      </button>

                      {/* Image Container with Hover Effect */}
                      <div className="h-full w-full relative overflow-hidden">
                        {category.image === 'question' ? (
                          <div className="h-full w-full bg-gradient-to-br from-[#8B5A2B] via-[#A67B5B] to-[#C49A6C] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                            <HelpCircle size={70} className="text-white/80" />
                          </div>
                        ) : (
                          <img 
                            src={category.image} 
                            alt={category.name[language]} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        
                        {/* Dark Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
                      </div>

                      {/* Title Overlay with Gradient */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-20">
                        <p className="text-white text-center font-bold text-base md:text-lg truncate drop-shadow-lg">
                          {category.name[language]}
                        </p>
                        <p className="text-white/60 text-center text-xs mt-1">
                          {category.count} {language === 'ar' ? 'سؤال' : 'Questions'}
                        </p>
                      </div>
                      
                      {/* Glow Effect on Hover */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ boxShadow: 'inset 0 0 30px rgba(139, 90, 43, 0.3)' }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Info Modal */}
      <Modal
        isOpen={!!showInfo}
        onClose={() => setShowInfo(null)}
        title={showInfo?.name[language] || ''}
        icon="ℹ️"
      >
        <div className="text-center">
          {showInfo?.image && showInfo.image !== 'question' && (
            <img src={showInfo.image} alt="" className="w-32 h-32 object-cover rounded-xl mx-auto mb-4" />
          )}
          <p className="text-gray-600 mb-4">{showInfo?.description?.[language] || ''}</p>
          <p className="text-[#8B5A2B] font-semibold">
            {showInfo?.count} {language === 'ar' ? 'أسئلة' : 'Questions'}
          </p>
        </div>
      </Modal>
    </div>
  );
}
