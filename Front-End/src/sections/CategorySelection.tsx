import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { gameLogo, infoIcon } from '@/data/categories';
import { categoriesAPI, sectionsAPI } from '@/services/api';
import { mapApiCategoryToUi } from '@/lib/categoryMapper';
import type { Category } from '@/types';
import { ArrowLeft, Check, X, HelpCircle, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface CategorySelectionProps {
  onBack: () => void;
  onStart: (categories: Category[]) => void;
}

export function CategorySelection({ onBack, onStart }: CategorySelectionProps) {
  const { language, dir } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [showInfo, setShowInfo] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [sectionsList, setSectionsList] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, secRes] = await Promise.all([
          categoriesAPI.getAll(),
          sectionsAPI.getAll()
        ]);
        setCategories((catRes.data || []).map(mapApiCategoryToUi));
        setSectionsList((secRes as any).data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleCategory = (category: Category) => {
    setError('');
    const isSelected = selectedCategories.find(c => c.id === category.id);
    
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      if (selectedCategories.length >= 6) {
        setError('select6Cats');
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId));
  };

  const handleStart = () => {
    if (selectedCategories.length !== 6) {
      setError('select6Cats');
      return;
    }
    onStart(selectedCategories);
  };

  // Merge API sections + any section found in categories that's not in the API list
  const apiSections = sectionsList
    .filter((s: any) => s.is_active)
    .map((s: any) => ({ id: s.slug, name: { ar: s.name_ar, en: s.name_en } }));

  const apiSlugs = new Set(apiSections.map((s: any) => s.id));

  const extraSections = [...new Set(categories.map((c: any) => c.section))]
    .filter(id => !apiSlugs.has(id))
    .map(id => ({ id, name: { ar: id, en: id } }));

  const sections = [...apiSections, ...extraSections];

  return (
    <div className="min-h-screen flex flex-col pb-48" dir={dir}>
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
            <div className="flex items-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full font-bold">
                {t('selected', language)}: <span className="text-yellow-300">{selectedCategories.length}</span> / 6
              </span>
              <LanguageSelector />
            </div>
          </div>
          
          <div className="text-center">
            <img 
              src={gameLogo}
              alt="Clash of Minds" 
              className="w-32 md:w-48 mx-auto mb-4"
            />
            <h2 className="text-xl md:text-2xl font-bold">{t('select6Categories', language)}</h2>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-b border-red-300 text-red-700 px-4 py-3 text-center">
          {t(error, language)}
        </div>
      )}

      {/* Categories Grid */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {loading ? (
            <div className="text-center text-[#5D3A1A] font-bold text-xl py-20">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : (
            sections.map((section) => {
              const sectionCategories = categories.filter(cat => cat.section === section.id);
              if (sectionCategories.length === 0) return null;
              
              return (
                <div key={section.id} className="space-y-4">
                  <h3 className="text-2xl font-bold text-[#5D3A1A] border-b-2 border-[#8B5A2B] pb-2">
                    {section.name[language]}
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sectionCategories.map((category) => {
                      const isSelected = selectedCategories.find(c => c.id === category.id);
                      
                      return (
                        <div
                          key={category.id}
                          onClick={() => toggleCategory(category)}
                          className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 ${
                            isSelected 
                              ? 'ring-4 ring-[#8B5A2B] shadow-xl' 
                              : 'shadow-md hover:shadow-xl'
                          }`}
                          style={{ aspectRatio: '3/4' }}
                        >
                          {/* Info Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInfo(category);
                            }}
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                          >
                            <img src={infoIcon} alt="info" className="w-5 h-5" />
                          </button>
                          
                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              <Check size={16} />
                            </div>
                          )}

                          {/* Full Image */}
                          <div className="h-full w-full">
                            {category.image === 'question' ? (
                              <div className="h-full w-full bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] flex items-center justify-center">
                                <HelpCircle size={60} className="text-white" />
                              </div>
                            ) : (
                              <img 
                                src={category.image} 
                                alt={category.name[language]} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                            <p className="text-white text-center font-bold text-sm truncate">
                              {category.name[language]}
                            </p>
                            <p className="text-white/70 text-center text-xs font-semibold">
                              {category.count || 6}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Bottom Bar with Selected Categories */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#5D3A1A] to-[#8B5A2B] shadow-2xl z-50">
        {/* Selected Categories Row - Professional Style */}
        {selectedCategories.length > 0 && (
          <div className="bg-[#3D2914] p-4 border-b border-[#8B5A2B]/30">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4">
                {/* Label */}
                <div className="bg-[#8B5A2B] text-white px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap">
                  {language === 'ar' ? 'الفئات المختارة' : 'Selected Categories'}
                </div>
                
                {/* Selected Categories */}
                <div className="flex gap-2 overflow-x-auto flex-1 pb-1">
                  {selectedCategories.map((cat) => (
                    <div 
                      key={cat.id}
                      className="relative flex-shrink-0 group"
                    >
                      <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg">
                        {cat.image === 'question' ? (
                          <div className="h-full w-full bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] flex items-center justify-center">
                            <HelpCircle size={24} className="text-white" />
                          </div>
                        ) : (
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      {/* Question count - upside down */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#8B5A2B] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {cat.count || 6}
                      </div>
                      {/* Remove button */}
                      <button 
                        onClick={() => removeCategory(cat.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: 6 - selectedCategories.length }).map((_, i) => (
                    <div 
                      key={`empty-${i}`}
                      className="w-16 h-20 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center flex-shrink-0"
                    >
                      <Plus size={20} className="text-white/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              {t('back', language)}
            </button>
            
            {/* Selected Count */}
            <div className="text-center bg-white/10 px-6 py-2 rounded-full">
              <p className="text-white font-bold text-lg">
                {selectedCategories.length} / 6
              </p>
            </div>
            
            <button
              onClick={handleStart}
              disabled={selectedCategories.length !== 6}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                selectedCategories.length === 6
                  ? 'bg-white text-[#5D3A1A] hover:shadow-lg hover:scale-105'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {t('startGame', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={!!showInfo}
        onClose={() => setShowInfo(null)}
        title={showInfo?.name[language] || ''}
        icon="ℹ️"
      >
        <p className="text-gray-600">{showInfo?.description?.[language] || ''}</p>
        <p className="text-[#8B5A2B] font-semibold mt-4">
          {showInfo?.count || 6} {language === 'ar' ? 'أسئلة' : 'Questions'}
        </p>
      </Modal>
    </div>
  );
}
