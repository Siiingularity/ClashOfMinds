import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { RotateCcw } from 'lucide-react';

interface ResultScreenProps {
  winner: string;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  onNewGame: () => void;
}

export function ResultScreen({ winner, team1Name, team2Name, team1Score, team2Score, onNewGame }: ResultScreenProps) {
  const { language, dir } = useLanguage();

  const isDraw = !winner;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={dir}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        {/* Trophy */}
        <div className="text-8xl mb-6 animate-bounce">
          {isDraw ? '🤝' : '🏆'}
        </div>

        {/* Winner Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#5D3A1A] mb-8">
          {isDraw 
            ? t('draw', language)
            : `${t('winner', language)}: ${winner}`
          }
        </h2>

        {/* Scores */}
        <div className="flex justify-center gap-6 md:gap-12 mb-10">
          <div className={`bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] rounded-2xl p-6 md:p-8 min-w-[140px] md:min-w-[180px] ${
            team1Score > team2Score ? 'ring-4 ring-[#8B5A2B]' : ''
          }`}>
            <p className="text-[#5D3A1A] font-bold text-lg md:text-xl mb-2">{team1Name}</p>
            <p className="text-4xl md:text-5xl font-bold text-[#8B5A2B]">{team1Score}</p>
          </div>
          
          <div className={`bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] rounded-2xl p-6 md:p-8 min-w-[140px] md:min-w-[180px] ${
            team2Score > team1Score ? 'ring-4 ring-[#8B5A2B]' : ''
          }`}>
            <p className="text-[#5D3A1A] font-bold text-lg md:text-xl mb-2">{team2Name}</p>
            <p className="text-4xl md:text-5xl font-bold text-[#8B5A2B]">{team2Score}</p>
          </div>
        </div>

        {/* New Game Button */}
        <button
          onClick={onNewGame}
          className="bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white px-10 py-4 rounded-2xl font-bold text-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
        >
          <RotateCcw size={24} />
          {t('newGame', language)}
        </button>
      </div>
    </div>
  );
}
