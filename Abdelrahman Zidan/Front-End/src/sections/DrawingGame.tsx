import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Clock, Eraser, Palette, Trash2, Check } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface DrawingGameProps {
  word: string;
  onComplete: (drawingData: string) => void;
  onSkip: () => void;
  timeLimit?: number;
}

export function DrawingGame({ word, onComplete, onSkip, timeLimit = 60 }: DrawingGameProps) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#8B5A2B', '#FFA500', '#800080'];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const setEraser = () => {
    setBrushColor('#FFFFFF');
    setBrushSize(20);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const drawingData = canvas.toDataURL('image/png');
    onComplete(drawingData);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] p-4 flex items-center justify-between shrink-0">
        <button
          onClick={onSkip}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-white transition-colors"
        >
          <ArrowLeft size={18} />
          {language === 'ar' ? 'تخطي' : 'Skip'}
        </button>
        
        {/* Word to Draw */}
        <div className="bg-white rounded-2xl px-8 py-3 shadow-lg">
          <p className="text-[#5D3A1A] text-sm mb-1">{language === 'ar' ? 'ارسم:' : 'Draw:'}</p>
          <p className="text-[#5D3A1A] text-2xl md:text-3xl font-bold">{word}</p>
        </div>
        
        {/* Timer */}
        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2">
          <Clock size={20} className="text-[#5D3A1A]" />
          <span className={`text-2xl font-bold font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-[#5D3A1A]'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Tools Sidebar */}
        <div className="w-full md:w-20 bg-white rounded-2xl shadow-xl p-3 flex md:flex-col items-center gap-3 shrink-0">
          {/* Color Picker Toggle */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] flex items-center justify-center hover:scale-110 transition-transform"
            style={{ backgroundColor: brushColor === '#FFFFFF' ? '#F5E6D3' : brushColor }}
          >
            <Palette size={20} className="text-[#5D3A1A]" />
          </button>

          {/* Color Palette */}
          {showColorPicker && (
            <div className="absolute md:relative z-10 bg-white rounded-xl shadow-xl p-2 grid grid-cols-5 md:grid-cols-2 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setBrushColor(color);
                    setBrushSize(4);
                  }}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* Brush Sizes */}
          <div className="flex md:flex-col gap-2">
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  brushSize === size && brushColor !== '#FFFFFF'
                    ? 'bg-[#8B5A2B] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div 
                  className={`rounded-full ${brushSize === size && brushColor !== '#FFFFFF' ? 'bg-white' : 'bg-[#5D3A1A]'}`}
                  style={{ width: size * 2, height: size * 2 }}
                />
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-gray-200 my-1"></div>

          {/* Eraser */}
          <button
            onClick={setEraser}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              brushColor === '#FFFFFF' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[#5D3A1A]'
            }`}
          >
            <Eraser size={20} />
          </button>

          {/* Clear Canvas */}
          <button
            onClick={clearCanvas}
            className="w-12 h-12 rounded-xl bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition-colors"
          >
            <Trash2 size={20} />
          </button>

          <div className="flex-1"></div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <Check size={24} />
          </button>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title={language === 'ar' ? 'تأكيد الإرسال' : 'Confirm Submit'}
        icon="✓"
      >
        <p className="text-gray-600 mb-6 text-center">
          {language === 'ar' ? 'هل أنت متأكد من إرسال الرسمة؟' : 'Are you sure you want to submit the drawing?'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowConfirmSubmit(false)}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            {language === 'ar' ? 'إرسال' : 'Submit'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
