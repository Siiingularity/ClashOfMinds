import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Users, ArrowLeft, RefreshCw } from 'lucide-react';

interface DrawingQRDisplayProps {
  sessionId: string;
  word: string;
  onDrawingReceived: (drawingData: string) => void;
  onCancel: () => void;
  teamName: string;
}

export function DrawingQRDisplay({ sessionId, word, onDrawingReceived, onCancel, teamName }: DrawingQRDisplayProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(90);
  const [status, setStatus] = useState<'waiting' | 'received'>('waiting');
  const [drawingData, setDrawingData] = useState<string | null>(null);

  // Generate the mobile drawing URL
  const drawingUrl = `${window.location.origin}/draw/${sessionId}?word=${encodeURIComponent(word)}`;

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onCancel();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onCancel]);

  // Poll for drawing data (simulating real-time sync)
  useEffect(() => {
    const checkForDrawing = () => {
      const savedDrawing = localStorage.getItem(`drawing_${sessionId}`);
      if (savedDrawing) {
        setDrawingData(savedDrawing);
        setStatus('received');
        onDrawingReceived(savedDrawing);
        localStorage.removeItem(`drawing_${sessionId}`);
      }
    };

    const interval = setInterval(checkForDrawing, 1000);
    return () => clearInterval(interval);
  }, [sessionId, onDrawingReceived]);

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#5D3A1A] to-[#8B5A2B] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-white transition-colors"
        >
          <ArrowLeft size={18} />
          {language === 'ar' ? 'رجوع' : 'Back'}
        </button>
        
        <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-white">
          <Users size={18} />
          <span>{teamName}</span>
        </div>
        
        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2">
          <Clock size={18} className="text-[#5D3A1A]" />
          <span className={`text-xl font-bold font-mono ${timeLeft <= 15 ? 'text-red-500' : 'text-[#5D3A1A]'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {status === 'waiting' ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            {/* Instructions */}
            <h2 className="text-2xl font-bold text-[#5D3A1A] mb-4">
              {language === 'ar' ? 'حان وقت الرسم!' : 'Time to Draw!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'ar' 
                ? 'امسح رمز QR باستخدام هاتفك للرسم'
                : 'Scan the QR code with your phone to draw'}
            </p>

            {/* Word Display */}
            <div className="bg-gradient-to-r from-[#F5E6D3] to-[#E8D5C4] rounded-2xl p-4 mb-6">
              <p className="text-sm text-[#8B5A2B] mb-1">
                {language === 'ar' ? 'الكلمة السرية:' : 'Secret Word:'}
              </p>
              <p className="text-3xl font-bold text-[#5D3A1A]">{word}</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-inner inline-block mb-4">
              <QRCodeSVG 
                value={drawingUrl} 
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#5D3A1A"
              />
            </div>

            {/* Session ID */}
            <p className="text-sm text-gray-400">
              {language === 'ar' ? 'معرف الجلسة:' : 'Session ID:'} {sessionId}
            </p>

            {/* Loading Indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[#8B5A2B]">
              <RefreshCw size={20} className="animate-spin" />
              <span>{language === 'ar' ? 'في انتظار الرسم...' : 'Waiting for drawing...'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              {language === 'ar' ? 'تم استلام الرسمة!' : 'Drawing Received!'}
            </h2>
            {drawingData && (
              <img 
                src={drawingData} 
                alt="Drawing" 
                className="w-full max-h-80 object-contain rounded-2xl border-4 border-[#8B5A2B]"
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="p-4 text-center text-white/80">
        <p className="text-sm">
          {language === 'ar' 
            ? 'افتح الكاميرا على هاتفك ووجهها نحو رمز QR'
            : 'Open your phone camera and point it at the QR code'}
        </p>
      </div>
    </div>
  );
}
