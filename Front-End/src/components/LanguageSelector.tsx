import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
          language === 'ar'
            ? 'bg-[#8B5A2B] text-white'
            : 'bg-white/80 text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
          language === 'en'
            ? 'bg-[#8B5A2B] text-white'
            : 'bg-white/80 text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
        }`}
      >
        English
      </button>
    </div>
  );
}
