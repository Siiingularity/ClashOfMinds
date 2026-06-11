import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: string;
}

export function Modal({ isOpen, onClose, title, children, icon }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full relative animate-fadeIn"
        style={{ border: '3px solid #8B5A2B' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        {icon && (
          icon.startsWith('http') ? (
            <div className="flex justify-center mb-4">
              <img src={icon} alt="" className="w-16 h-16 object-contain" />
            </div>
          ) : (
            <div className="text-5xl mb-4 text-center">{icon}</div>
          )
        )}
        
        <h3 className="text-2xl font-bold text-[#5D3A1A] mb-4 text-center">{title}</h3>
        
        <div className="text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
}
