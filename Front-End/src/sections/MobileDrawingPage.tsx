import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, Eraser, Trash2, Check } from 'lucide-react';

export function MobileDrawingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const word = searchParams.get('word') || 'Unknown';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#8B5A2B', '#FFA500', '#800080'];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

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

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
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
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
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
    setBrushSize(30);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !sessionId) return;
    
    const drawingData = canvas.toDataURL('image/png');
    
    // Save to localStorage for the main screen to pick up
    localStorage.setItem(`drawing_${sessionId}`, drawingData);
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5D3A1A] to-[#8B5A2B] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#5D3A1A] mb-2">تم الإرسال!</h2>
          <p className="text-gray-600">تم إرسال الرسمة بنجاح</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] p-3 flex items-center justify-between shrink-0">
        {/* Word to Draw */}
        <div className="bg-white rounded-xl px-4 py-2">
          <p className="text-[#5D3A1A] text-xs">ارسم:</p>
          <p className="text-[#5D3A1A] text-lg font-bold">{word}</p>
        </div>
        
        {/* Timer */}
        <div className="bg-white rounded-full px-3 py-1 flex items-center gap-1">
          <Clock size={16} className="text-[#5D3A1A]" />
          <span className={`text-lg font-bold font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-[#5D3A1A]'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-2">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
          <canvas
            ref={canvasRef}
            width={600}
            height={700}
            className="w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white p-3 flex items-center justify-between gap-2 shrink-0">
        {/* Colors */}
        <div className="flex gap-1 overflow-x-auto">
          {colors.slice(0, 5).map((color) => (
            <button
              key={color}
              onClick={() => {
                setBrushColor(color);
                setBrushSize(6);
              }}
              className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                brushColor === color ? 'border-[#8B5A2B] scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Eraser */}
        <button
          onClick={setEraser}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            brushColor === '#FFFFFF' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100'
          }`}
        >
          <Eraser size={18} />
        </button>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center"
        >
          <Trash2 size={18} />
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1"
        >
          <Check size={18} />
          انتهيت
        </button>
      </div>
    </div>
  );
}
