import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Social Icons */}
          <div className="flex gap-4">
            <a 
              href="https://instagram.com/mc.e" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              <Instagram size={22} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              <Twitter size={22} />
            </a>
            <a 
              href="mailto:clashofminds01@gmail.com"
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              <Mail size={22} />
            </a>
          </div>
          
          {/* Instagram Handle */}
          <a 
            href="https://instagram.com/mc.e" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/80 text-sm hover:text-white transition-colors"
          >
            @mc.e
          </a>
          
          {/* Copyright */}
          <p className="text-white/80 text-sm">
            © 2024 Clash of Minds. {t('allRightsReserved', language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
