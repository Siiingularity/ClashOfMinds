import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Users, Zap, Target, Gamepad2, Trophy, Clock } from 'lucide-react';

interface HowToPlayProps {
  onBack: () => void;
}

export function HowToPlay({ onBack }: HowToPlayProps) {
  const { language, dir } = useLanguage();

  const steps = [
    {
      icon: Users,
      title: language === 'ar' ? 'إنشاء اللعبة' : 'Create Game',
      description: language === 'ar' 
        ? 'أدخل اسم اللعبة وعدد اللاعبين وأسماء الفرق'
        : 'Enter game name, number of players, and team names'
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'اختيار الوقت' : 'Choose Time',
      description: language === 'ar'
        ? 'حدد وقت الإجابة لكل فريق (من 15 إلى 120 ثانية)'
        : 'Set answer time for each team (15 to 120 seconds)'
    },
    {
      icon: Zap,
      title: language === 'ar' ? 'اختيار وسائل المساعدة' : 'Choose Power-ups',
      description: language === 'ar'
        ? 'اختر 3 وسائل مساعدة لكل فريق من بين 5 وسائل'
        : 'Choose 3 power-ups for each team from 5 options'
    },
    {
      icon: Target,
      title: language === 'ar' ? 'اختيار الفئات' : 'Choose Categories',
      description: language === 'ar'
        ? 'اختر 6 فئات من بين الفئات المتاحة في الأقسام المختلفة'
        : 'Choose 6 categories from available categories in different sections'
    },
    {
      icon: Gamepad2,
      title: language === 'ar' ? 'بدء اللعبة' : 'Start Game',
      description: language === 'ar'
        ? 'الفريق الأول يختار سؤالاً ويحاول الإجابة في الوقت المحدد'
        : 'Team 1 selects a question and tries to answer within the time limit'
    },
    {
      icon: Trophy,
      title: language === 'ar' ? 'الفوز' : 'Winning',
      description: language === 'ar'
        ? 'الفريق ذو النقاط الأعلى في نهاية اللعبة يفوز!'
        : 'The team with the highest score at the end wins!'
    }
  ];

  const powerups = [
    {
      icon: 'https://i.imgur.com/e1Ywhk4.png',
      name: language === 'ar' ? 'سرقة السؤال' : 'Steal Question',
      description: language === 'ar' 
        ? 'يمكنك سرقة سؤال الفريق الخصم والإجابة عليه'
        : 'Steal opponent\'s question and answer it'
    },
    {
      icon: 'https://i.imgur.com/VtMtaCu.png',
      name: language === 'ar' ? 'منع الخصم' : 'Block Opponent',
      description: language === 'ar'
        ? 'يمنع الفريق الخصم من الإجابة على السؤال القادم'
        : 'Prevents opponent from answering next question'
    },
    {
      icon: 'https://i.imgur.com/PdUyRQG.png',
      name: language === 'ar' ? 'تدبيل النقاط' : 'Double Points',
      description: language === 'ar'
        ? 'يتم تدبيل نقاط السؤال القادم'
        : 'Doubles points for next question'
    },
    {
      icon: 'https://i.imgur.com/r2gvY0n.png',
      name: language === 'ar' ? 'اتصال بصديق' : 'Call a Friend',
      description: language === 'ar'
        ? 'اتصل بصديق للمساعدة في الإجابة'
        : 'Call a friend for help'
    },
    {
      icon: 'https://i.imgur.com/3R4plWC.png',
      name: language === 'ar' ? 'إجابتين' : 'Two Answers',
      description: language === 'ar'
        ? 'يمكنك تجربة إجابتين للسؤال'
        : 'Try two answers for the question'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          
          <img 
            src="https://res.cloudinary.com/ddoa8gqdz/image/upload/v1774260293/logo_dronvr.png" 
            alt="Clash of Minds" 
            className="w-40 md:w-52"
          />
          
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5D3A1A] text-center mb-8">
            {language === 'ar' ? 'كيفية اللعب' : 'How to Play'}
          </h1>

          {/* Steps */}
          <div className="space-y-6 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={28} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 bg-[#F5E6D3] text-[#8B5A2B] rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-bold text-[#5D3A1A]">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PowerUps Section */}
          <h2 className="text-2xl font-bold text-[#5D3A1A] text-center mb-6">
            {language === 'ar' ? 'وسائل المساعده' : 'Power-ups'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {powerups.map((powerup, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <img 
                  src={powerup.icon} 
                  alt={powerup.name} 
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-lg font-bold text-[#5D3A1A] mb-2">{powerup.name}</h3>
                <p className="text-gray-600 text-sm">{powerup.description}</p>
              </div>
            ))}
          </div>

          {/* Points Info */}
          <div className="mt-12 bg-[#F5E6D3] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-[#5D3A1A] text-center mb-6">
              {language === 'ar' ? 'نقاط الأسئلة' : 'Question Points'}
            </h2>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2E8B57] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
                  200
                </div>
                <p className="text-[#5D3A1A] font-semibold">
                  {language === 'ar' ? 'سهل' : 'Easy'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4682B4] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
                  400
                </div>
                <p className="text-[#5D3A1A] font-semibold">
                  {language === 'ar' ? 'متوسط' : 'Medium'}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#8B4513] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
                  600
                </div>
                <p className="text-[#5D3A1A] font-semibold">
                  {language === 'ar' ? 'صعب' : 'Hard'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
