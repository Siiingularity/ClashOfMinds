import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import { powerUps, gameLogo } from '@/data/categories';
import { ArrowLeft, Users, Gamepad2, Zap, Clock } from 'lucide-react';

interface GameSetupProps {
  onBack: () => void;
  onNext: (config: GameConfig) => void;
}

export interface GameConfig {
  sessionName: string;
  playerCount: number;
  team1Name: string;
  team2Name: string;
  team1Powerups: string[];
  team2Powerups: string[];
  team1Time: number;
  team2Time: number;
}

export function GameSetup({ onBack, onNext }: GameSetupProps) {
  const { language, dir } = useLanguage();
  
  const [config, setConfig] = useState<GameConfig>({
    sessionName: '',
    playerCount: 2,
    team1Name: language === 'ar' ? 'الفريق الأول' : 'Team 1',
    team2Name: language === 'ar' ? 'الفريق الثاني' : 'Team 2',
    team1Powerups: [],
    team2Powerups: [],
    team1Time: 60,
    team2Time: 30
  });
  
  const [error, setError] = useState('');

  const togglePowerup = (team: 1 | 2, powerupId: string) => {
    const teamPowerups = team === 1 ? 'team1Powerups' : 'team2Powerups';
    const current = config[teamPowerups];
    
    if (current.includes(powerupId)) {
      setConfig({
        ...config,
        [teamPowerups]: current.filter(id => id !== powerupId)
      });
    } else {
      if (current.length >= 3) {
        setError('select3Powerups');
        return;
      }
      setConfig({
        ...config,
        [teamPowerups]: [...current, powerupId]
      });
    }
    setError('');
  };

  const handleSubmit = () => {
    if (config.team1Powerups.length !== 3 || config.team2Powerups.length !== 3) {
      setError('select3Powerups');
      return;
    }
    
    onNext(config);
  };

  const timeOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[#5D3A1A] font-semibold hover:text-[#8B5A2B] transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img 
              src={gameLogo}
              alt="Clash of Minds" 
              className="w-48 md:w-64 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-[#5D3A1A]">{t('gameSetup', language)}</h2>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
              {t(error, language)}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Session Name */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2 flex items-center gap-2">
                  <Gamepad2 size={18} />
                  {t('sessionName', language)}
                </label>
                <input
                  type="text"
                  value={config.sessionName}
                  onChange={(e) => setConfig({ ...config, sessionName: e.target.value })}
                  placeholder={t('sessionPlaceholder', language)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                />
              </div>

              {/* Player Count */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2 flex items-center gap-2">
                  <Users size={18} />
                  {t('playerCount', language)}
                </label>
                <select
                  value={config.playerCount}
                  onChange={(e) => setConfig({ ...config, playerCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {language === 'ar' ? 'لاعبين' : 'Players'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team 1 Name */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2">
                  {t('team1Name', language)}
                </label>
                <input
                  type="text"
                  value={config.team1Name}
                  onChange={(e) => setConfig({ ...config, team1Name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                />
              </div>

              {/* Team 2 Name */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2">
                  {t('team2Name', language)}
                </label>
                <input
                  type="text"
                  value={config.team2Name}
                  onChange={(e) => setConfig({ ...config, team2Name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                />
              </div>

              {/* Team 1 Time */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  {language === 'ar' ? `وقت الإجابة - ${config.team1Name}` : `Answer Time - ${config.team1Name}`}
                </label>
                <select
                  value={config.team1Time}
                  onChange={(e) => setConfig({ ...config, team1Time: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time} {language === 'ar' ? 'ثانية' : 'seconds'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team 2 Time */}
              <div>
                <label className="block text-[#5D3A1A] font-bold mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  {language === 'ar' ? `وقت الإجابة - ${config.team2Name}` : `Answer Time - ${config.team2Name}`}
                </label>
                <select
                  value={config.team2Time}
                  onChange={(e) => setConfig({ ...config, team2Time: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#8B5A2B] focus:outline-none transition-colors"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time} {language === 'ar' ? 'ثانية' : 'seconds'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PowerUps Selection */}
            <div className="space-y-6">
              {/* Team 1 PowerUps */}
              <div className="bg-[#F5E6D3] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#5D3A1A] mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  {language === 'ar' 
                    ? `اختر 3 وسائل مساعدة لفريق ${config.team1Name}`
                    : `Select 3 power-ups for ${config.team1Name}`}
                </h3>
                <div className="space-y-3">
                  {/* First row - 3 powerups */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {powerUps.slice(0, 3).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => togglePowerup(1, power.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                          config.team1Powerups.includes(power.id)
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white'
                            : 'bg-white text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
                        }`}
                      >
                        <img src={power.icon} alt="" className="w-6 h-6" />
                        <span>{power.name[language]}</span>
                      </button>
                    ))}
                  </div>
                  {/* Second row - 2 powerups */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {powerUps.slice(3, 5).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => togglePowerup(1, power.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                          config.team1Powerups.includes(power.id)
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white'
                            : 'bg-white text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
                        }`}
                      >
                        <img src={power.icon} alt="" className="w-6 h-6" />
                        <span>{power.name[language]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team 2 PowerUps */}
              <div className="bg-[#F5E6D3] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#5D3A1A] mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  {language === 'ar' 
                    ? `اختر 3 وسائل مساعدة لفريق ${config.team2Name}`
                    : `Select 3 power-ups for ${config.team2Name}`}
                </h3>
                <div className="space-y-3">
                  {/* First row - 3 powerups */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {powerUps.slice(0, 3).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => togglePowerup(2, power.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                          config.team2Powerups.includes(power.id)
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white'
                            : 'bg-white text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
                        }`}
                      >
                        <img src={power.icon} alt="" className="w-6 h-6" />
                        <span>{power.name[language]}</span>
                      </button>
                    ))}
                  </div>
                  {/* Second row - 2 powerups */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {powerUps.slice(3, 5).map((power) => (
                      <button
                        key={power.id}
                        onClick={() => togglePowerup(2, power.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                          config.team2Powerups.includes(power.id)
                            ? 'bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white'
                            : 'bg-white text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white'
                        }`}
                      >
                        <img src={power.icon} alt="" className="w-6 h-6" />
                        <span>{power.name[language]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleSubmit}
              className="w-full mt-8 bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              {t('next', language)} - {t('categories', language)}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
