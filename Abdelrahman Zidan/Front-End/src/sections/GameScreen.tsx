import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/data/translations';
import type { Category, Question } from '@/types';
import { questionsDB, powerUps, gameLogo } from '@/data/categories';
import { gamesAPI } from '@/services/api';
import { LogOut, Flag, Clock, Home, AlertTriangle, Pause, Play, ArrowLeft, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface GameScreenProps {
  categories: Category[];
  config: {
    sessionName: string;
    team1Name: string;
    team2Name: string;
    team1Powerups: string[];
    team2Powerups: string[];
    team1Time: number;
    team2Time: number;
  };
  onExit: () => void;
  onEnd: (winner: string, team1Score: number, team2Score: number) => void;
  savedGameState?: any;
}

interface GameState {
  team1: { score: number; powerUps: Record<string, boolean> };
  team2: { score: number; powerUps: Record<string, boolean> };
  currentTurn: 1 | 2;
  answeredQuestions: Set<string>;
  doublePoints: boolean;
  blockedTeam: number | null;
}

export function GameScreen({ categories, config, onExit, onEnd, savedGameState }: GameScreenProps) {
  const { language, dir } = useLanguage();

  const [gameState, setGameState] = useState<GameState>(() => {
    if (savedGameState) {
      return {
        ...savedGameState,
        answeredQuestions: new Set(savedGameState.answeredQuestions)
      };
    }

    return {
      team1: {
        score: 0,
        powerUps: config.team1Powerups.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      },
      team2: {
        score: 0,
        powerUps: config.team2Powerups.reduce((acc, id) => ({ ...acc, [id]: true }), {})
      },
      currentTurn: 1,
      answeredQuestions: new Set(),
      doublePoints: false,
      blockedTeam: null
    };
  });

  const [currentQuestion, setCurrentQuestion] = useState<{
    question: Question;
    categoryIndex: number;
    questionIndex: number;
    team: 1 | 2;
    timeElapsed: number;
    showAnswer: boolean;
    isPaused: boolean;
  } | null>(null);

  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [powerupMessage, setPowerupMessage] = useState<{ icon: string; text: string } | null>(null);
  const [backendGameId, setBackendGameId] = useState<number | null>(() => {
    const saved = localStorage.getItem('currentGameId');
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    if (currentQuestion && !currentQuestion.showAnswer && !currentQuestion.isPaused) {
      const timer = setInterval(() => {
        setCurrentQuestion(prev => {
          if (!prev) return null;
          return { ...prev, timeElapsed: prev.timeElapsed + 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion]);

  const createGameSessionInBackend = async (): Promise<number | null> => {
    try {
      if (backendGameId) {
        return backendGameId;
      }

      const createdGame = await gamesAPI.create({
        sessionName: config.sessionName,
        team1Name: config.team1Name,
        team2Name: config.team2Name
      });

      const gameId = createdGame?.data?.id;

      if (!gameId) {
        console.error('No game ID returned from backend');
        return null;
      }

      setBackendGameId(gameId);
      localStorage.setItem('currentGameId', String(gameId));

      return gameId;
    } catch (error) {
      console.error('Failed to create game session in backend:', error);
      return null;
    }
  };

  useEffect(() => {
    void createGameSessionInBackend();
  }, []);

  const saveGameToBackend = async (winner: string, team1Score: number, team2Score: number) => {
    try {
      const gameId = backendGameId || (await createGameSessionInBackend());

      if (!gameId) {
        console.error('Cannot save game because game session was not created');
        return;
      }

      await gamesAPI.updateScores(gameId, {
        team1Score,
        team2Score
      });

      await gamesAPI.end(gameId, winner || undefined);

      localStorage.removeItem('currentGameId');
      setBackendGameId(null);
    } catch (error) {
      console.error('Failed to save game to backend:', error);
    }
  };

  const abandonGameInBackend = async () => {
    try {
      const savedId = localStorage.getItem('currentGameId');
      const gameId = backendGameId || (savedId ? Number(savedId) : null);

      if (!gameId) return;

      await gamesAPI.abandon(gameId);

      localStorage.removeItem('currentGameId');
      setBackendGameId(null);
    } catch (error) {
      console.error('Failed to abandon game:', error);
    }
  };

  const finishGame = async (team1Score: number, team2Score: number) => {
    const winner =
      team1Score > team2Score
        ? config.team1Name
        : team2Score > team1Score
        ? config.team2Name
        : '';

    await saveGameToBackend(winner, team1Score, team2Score);
    onEnd(winner, team1Score, team2Score);
  };

  const handleQuestionClick = (categoryIndex: number, questionIndex: number, team: 1 | 2) => {
    const questionKey = `${categoryIndex}-${questionIndex}`;
    if (gameState.answeredQuestions.has(questionKey)) return;

    if (gameState.blockedTeam === team) {
      showPowerupMessage(
        'https://i.imgur.com/VtMtaCu.png',
        language === 'ar' ? 'الفريق الخصم استخدم منع الخصم!' : 'Opponent used block!'
      );
      setGameState(prev => ({ ...prev, blockedTeam: null }));
      return;
    }

    const category = categories[categoryIndex];
    const categoryQuestions = questionsDB[category.name.ar] || [];
    const question = categoryQuestions[questionIndex];

    if (question) {
      setCurrentQuestion({
        question,
        categoryIndex,
        questionIndex,
        team,
        timeElapsed: 0,
        showAnswer: false,
        isPaused: false
      });
    }
  };

  const showPowerupMessage = (icon: string, text: string) => {
    setPowerupMessage({ icon, text });
    setTimeout(() => setPowerupMessage(null), 3000);
  };

  const handleAnswer = async (correct: boolean, answeringTeam?: 1 | 2) => {
    if (!currentQuestion) return;

    const team = answeringTeam || currentQuestion.team;
    const points = gameState.doublePoints
      ? currentQuestion.question.points * 2
      : currentQuestion.question.points;

    const updatedTeam1Score =
      correct && team === 1
        ? gameState.team1.score + points
        : gameState.team1.score;

    const updatedTeam2Score =
      correct && team === 2
        ? gameState.team2.score + points
        : gameState.team2.score;

    if (correct) {
      setGameState(prev => ({
        ...prev,
        [team === 1 ? 'team1' : 'team2']: {
          ...prev[team === 1 ? 'team1' : 'team2'],
          score: prev[team === 1 ? 'team1' : 'team2'].score + points
        },
        doublePoints: false
      }));
    } else if (gameState.doublePoints) {
      setGameState(prev => ({
        ...prev,
        doublePoints: false
      }));
    }

    setGameState(prev => ({
      ...prev,
      answeredQuestions: new Set([
        ...prev.answeredQuestions,
        `${currentQuestion.categoryIndex}-${currentQuestion.questionIndex}`
      ]),
      currentTurn: prev.currentTurn === 1 ? 2 : 1
    }));

    setCurrentQuestion(null);
    saveGameState();

    const totalAnsweredAfterThisQuestion = gameState.answeredQuestions.size + 1;
    const totalQuestions = categories.length * 6;

    if (totalAnsweredAfterThisQuestion >= totalQuestions) {
      await finishGame(updatedTeam1Score, updatedTeam2Score);
    }
  };

  const saveGameState = () => {
    const gameData = {
      gameState: {
        team1: gameState.team1,
        team2: gameState.team2,
        currentTurn: gameState.currentTurn,
        answeredQuestions: Array.from(gameState.answeredQuestions),
        doublePoints: gameState.doublePoints,
        blockedTeam: gameState.blockedTeam
      },
      categories: categories.map(c => c.id),
      config,
      timestamp: Date.now()
    };

    localStorage.setItem('savedGame', JSON.stringify(gameData));
  };

  const usePowerup = (powerupId: string, team: 1 | 2) => {
    const currentTeam = team === 1 ? 'team1' : 'team2';
    const powerup = powerUps.find(p => p.id === powerupId);

    if (!gameState[currentTeam].powerUps[powerupId]) {
      showPowerupMessage(
        powerup?.icon || '',
        language === 'ar' ? 'هذه الوسيلة غير متوفرة!' : 'This power-up is not available!'
      );
      return;
    }

    let message = '';

    switch (powerupId) {
      case 'double':
        setGameState(prev => ({ ...prev, doublePoints: true }));
        message = language === 'ar' ? 'تم تفعيل تدبيل النقاط!' : 'Double points activated!';
        break;
      case 'block':
        setGameState(prev => ({ ...prev, blockedTeam: prev.currentTurn === 1 ? 2 : 1 }));
        message = language === 'ar' ? 'تم منع الفريق الخصم!' : 'Opponent blocked!';
        break;
      case 'steal':
        message = language === 'ar' ? 'يمكنك الآن سرقة سؤال الخصم!' : 'You can now steal opponent question!';
        break;
      case 'callfriend':
        message = language === 'ar' ? 'اتصل بصديق للمساعدة!' : 'Call a friend for help!';
        break;
      case 'twoanswers':
        message = language === 'ar' ? 'يمكنك تجربة إجابتين!' : 'You can try two answers!';
        break;
    }

    if (powerup) {
      showPowerupMessage(powerup.icon, message);
    }

    setGameState(prev => ({
      ...prev,
      [currentTeam]: {
        ...prev[currentTeam],
        powerUps: { ...prev[currentTeam].powerUps, [powerupId]: false }
      }
    }));
  };

  const adjustScore = (team: 1 | 2, delta: number) => {
    setGameState(prev => ({
      ...prev,
      [team === 1 ? 'team1' : 'team2']: {
        ...prev[team === 1 ? 'team1' : 'team2'],
        score: Math.max(0, prev[team === 1 ? 'team1' : 'team2'].score + delta)
      }
    }));
  };

  const resetTimer = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, timeElapsed: 0 });
    }
  };

  const currentTeamName = gameState.currentTurn === 1 ? config.team1Name : config.team2Name;

  const ScoreBox = ({
    points,
    isAnswered,
    onClick
  }: {
    points: number;
    isAnswered: boolean;
    onClick: () => void;
  }) => {
    const bgColor = isAnswered
      ? 'bg-gray-400'
      : points === 200
      ? 'bg-[#4A7C59]'
      : points === 400
      ? 'bg-[#4A6FA5]'
      : 'bg-[#8B5A2B]';

    return (
      <button
        onClick={onClick}
        disabled={isAnswered}
        className={`w-full h-full ${bgColor} text-white font-bold text-lg md:text-xl rounded-lg transition-all hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center`}
      >
        {points}
      </button>
    );
  };

  const CategoryCard = ({ category, catIndex }: { category: Category; catIndex: number }) => {
    return (
      <div className="bg-[#E8E0D0] rounded-2xl overflow-hidden shadow-lg border-2 border-[#5D3A1A]/30 h-full">
        <div className="grid grid-cols-3 h-full">
          <div className="grid grid-rows-3 gap-1 p-1">
            {[200, 400, 600].map((points, idx) => {
              const qIndex = idx * 2;
              const questionKey = `${catIndex}-${qIndex}`;
              const isAnswered = gameState.answeredQuestions.has(questionKey);

              return (
                <ScoreBox
                  key={`left-${points}`}
                  points={points}
                  isAnswered={isAnswered}
                  onClick={() => handleQuestionClick(catIndex, qIndex, 1)}
                />
              );
            })}
          </div>

          <div className="flex flex-col p-1">
            <div className="flex-1 relative overflow-hidden rounded-lg">
              <img
                src={category.image}
                alt={category.name[language]}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ aspectRatio: '9/16' }}
              />
            </div>
            <div className="bg-[#5D3A1A] text-white text-center py-1.5 mt-1 rounded-lg">
              <p className="font-bold text-xs md:text-sm truncate px-1">{category.name[language]}</p>
            </div>
          </div>

          <div className="grid grid-rows-3 gap-1 p-1">
            {[200, 400, 600].map((points, idx) => {
              const qIndex = idx * 2 + 1;
              const questionKey = `${catIndex}-${qIndex}`;
              const isAnswered = gameState.answeredQuestions.has(questionKey);

              return (
                <ScoreBox
                  key={`right-${points}`}
                  points={points}
                  isAnswered={isAnswered}
                  onClick={() => handleQuestionClick(catIndex, qIndex, 2)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const TeamPowerups = ({ team }: { team: 1 | 2 }) => {
    const teamPowerups = team === 1 ? gameState.team1.powerUps : gameState.team2.powerUps;

    return (
      <div className="flex gap-1">
        {powerUps.map(power => {
          const hasPowerup = teamPowerups[power.id];

          return (
            <button
              key={power.id}
              onClick={() => usePowerup(power.id, team)}
              disabled={!hasPowerup}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                hasPowerup
                  ? 'bg-white/20 hover:bg-white/40 hover:scale-110'
                  : 'bg-white/5 opacity-30 cursor-not-allowed'
              }`}
              title={power.name[language]}
            >
              <img src={power.icon} alt="" className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F5E6D3]" dir={dir}>
      <header className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-2 md:p-3 shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExit()}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full flex items-center gap-2 transition-colors text-sm"
            >
              <Home size={16} />
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>

            <button
              onClick={() => setShowConfirmExit(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full flex items-center gap-2 transition-colors text-sm"
            >
              <LogOut size={16} />
              {t('exit', language)}
            </button>

            <button
              onClick={() => setShowConfirmEnd(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full flex items-center gap-2 transition-colors text-sm"
            >
              <Flag size={16} />
              {t('endGame', language)}
            </button>
          </div>

          <img src={gameLogo} alt="Clash of Minds" className="w-20 md:w-28" />

          <div className="bg-white/20 px-4 py-2 rounded-full text-sm">
            {t('turn', language)}: <span className="font-bold">{currentTeamName}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-4 overflow-hidden">
        <div className="h-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-3 grid-rows-2 gap-3 md:gap-4 h-full">
            {categories.map((category, catIndex) => (
              <CategoryCard key={category.id} category={category} catIndex={catIndex} />
            ))}
          </div>
        </div>
      </main>

      <div className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-2 md:p-3 shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 bg-white/10 px-3 py-2 rounded-xl">
            <TeamPowerups team={2} />
            <div className="text-center">
              <p className="font-bold text-xs md:text-sm truncate max-w-[80px]">{config.team2Name}</p>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-full p-1">
              <button
                onClick={() => adjustScore(2, -100)}
                className="w-6 h-6 md:w-8 md:h-8 bg-[#8B5A2B] text-white rounded-full font-bold hover:bg-[#5D3A1A] transition-colors text-sm"
              >
                -
              </button>
              <span className="w-10 md:w-14 text-center text-[#5D3A1A] font-bold text-lg md:text-xl">
                {gameState.team2.score}
              </span>
              <button
                onClick={() => adjustScore(2, 100)}
                className="w-6 h-6 md:w-8 md:h-8 bg-[#8B5A2B] text-white rounded-full font-bold hover:bg-[#5D3A1A] transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white/20 px-4 md:px-6 py-2 rounded-xl text-center">
            <p className="text-white/70 text-xs">{language === 'ar' ? 'دور' : 'Turn'}</p>
            <p className="text-white font-bold text-lg">{currentTeamName}</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 bg-white/10 px-3 py-2 rounded-xl">
            <div className="flex items-center gap-1 bg-white rounded-full p-1">
              <button
                onClick={() => adjustScore(1, -100)}
                className="w-6 h-6 md:w-8 md:h-8 bg-[#8B5A2B] text-white rounded-full font-bold hover:bg-[#5D3A1A] transition-colors text-sm"
              >
                -
              </button>
              <span className="w-10 md:w-14 text-center text-[#5D3A1A] font-bold text-lg md:text-xl">
                {gameState.team1.score}
              </span>
              <button
                onClick={() => adjustScore(1, 100)}
                className="w-6 h-6 md:w-8 md:h-8 bg-[#8B5A2B] text-white rounded-full font-bold hover:bg-[#5D3A1A] transition-colors text-sm"
              >
                +
              </button>
            </div>
            <div className="text-center">
              <p className="font-bold text-xs md:text-sm truncate max-w-[80px]">{config.team1Name}</p>
            </div>
            <TeamPowerups team={1} />
          </div>
        </div>
      </div>

      {currentQuestion && (
        <div className="fixed inset-0 z-[10000] bg-[#F5E6D3] flex flex-col">
          <div className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] p-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentQuestion(null)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-white transition-colors"
            >
              <ArrowLeft size={18} />
              {language === 'ar' ? 'عودة' : 'Back'}
            </button>

            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-white font-bold">
                {language === 'ar' ? `دور: ${currentTeamName}` : `Turn: ${currentTeamName}`}
              </span>
            </div>

            <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3">
              <button
                onClick={resetTimer}
                className="text-[#5D3A1A] hover:text-[#8B5A2B] transition-colors"
                title={language === 'ar' ? 'اعادة الوقت' : 'Reset Timer'}
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={() =>
                  setCurrentQuestion({ ...currentQuestion, isPaused: !currentQuestion.isPaused })
                }
                className="text-[#5D3A1A] hover:text-[#8B5A2B] transition-colors"
              >
                {currentQuestion.isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>

              <Clock size={20} className="text-[#5D3A1A]" />
              <span className="text-2xl md:text-3xl font-bold font-mono text-[#5D3A1A]">
                {String(Math.floor(currentQuestion.timeElapsed / 60)).padStart(2, '0')}:
                {String(currentQuestion.timeElapsed % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-white font-bold text-xl">
                {currentQuestion.question.points} {language === 'ar' ? 'نقطة' : 'pts'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
            {currentQuestion.question.image ? (
              <img
                src={currentQuestion.question.image}
                alt="Question"
                className="max-w-lg max-h-48 rounded-2xl shadow-xl mb-6"
              />
            ) : (
              <div className="w-40 h-40 bg-gradient-to-br from-[#8B5A2B] to-[#A67B5B] rounded-2xl flex items-center justify-center mb-6">
                <span className="text-7xl">❓</span>
              </div>
            )}

            <h2 className="text-[#5D3A1A] text-2xl md:text-4xl font-bold text-center max-w-4xl leading-relaxed mb-8">
              {currentQuestion.question?.question?.[language] || ''}
            </h2>

            {!currentQuestion.showAnswer && (
              <button
                onClick={() => setCurrentQuestion({ ...currentQuestion, showAnswer: true })}
                className="bg-gradient-to-r from-[#8B5A2B] to-[#A67B5B] text-white px-12 py-4 rounded-2xl font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all"
              >
                {language === 'ar' ? 'اظهار الاجابة' : 'Show Answer'}
              </button>
            )}

            {currentQuestion.showAnswer && (
              <div className="text-center w-full max-w-4xl">
                <div className="bg-gradient-to-r from-[#8B5A2B]/20 to-[#A67B5B]/20 backdrop-blur-md rounded-2xl p-8 mb-8">
                  {currentQuestion.question.answerImage && (
                    <img
                      src={currentQuestion.question.answerImage}
                      alt="Answer"
                      className="max-w-md max-h-40 rounded-xl mx-auto mb-4"
                    />
                  )}

                  <p className="text-[#5D3A1A]/70 text-lg mb-4">
                    {language === 'ar' ? 'الاجابة:' : 'Answer:'}
                  </p>

                  <p className="text-[#5D3A1A] text-3xl md:text-4xl font-bold">
                    {typeof currentQuestion.question?.answer === 'object'
                      ? currentQuestion.question?.answer?.[language] || ''
                      : currentQuestion.question?.answer || ''}
                  </p>
                </div>

                <div className="bg-white/50 rounded-2xl p-6 mb-8">
                  <p className="text-[#5D3A1A] text-xl mb-4">
                    {language === 'ar' ? 'من جاوب؟' : 'Who answered?'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => void handleAnswer(true, 1)}
                      className="bg-[#5D3A1A] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#4a2e15] hover:scale-105 transition-all"
                    >
                      {config.team1Name}
                    </button>

                    <button
                      onClick={() => void handleAnswer(true, 2)}
                      className="bg-[#8B5A2B] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#7a4a1b] hover:scale-105 transition-all"
                    >
                      {config.team2Name}
                    </button>

                    <button
                      onClick={() => void handleAnswer(false)}
                      className="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-600 hover:scale-105 transition-all"
                    >
                      {language === 'ar' ? 'لا احد' : 'No one'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-[#5D3A1A] to-[#8B5A2B] text-white p-4 shrink-0">
            <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl">
                <div className="text-center">
                  <p className="font-bold text-sm">{config.team2Name}</p>
                  <p className="text-2xl font-bold">{gameState.team2.score}</p>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              >
                <AlertTriangle size={18} />
                {language === 'ar' ? 'ابلاغ' : 'Report'}
              </button>

              <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl">
                <div className="text-center">
                  <p className="font-bold text-sm">{config.team1Name}</p>
                  <p className="text-2xl font-bold">{gameState.team1.score}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {powerupMessage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] bg-white rounded-3xl p-8 shadow-2xl animate-fadeIn text-center">
          <img src={powerupMessage.icon} alt="" className="w-24 h-24 mx-auto mb-4" />
          <p className="text-[#5D3A1A] text-2xl font-bold">{powerupMessage.text}</p>
        </div>
      )}

      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={language === 'ar' ? 'ابلاغ عن مشكلة' : 'Report Issue'}
        icon="⚠️"
      >
        <p className="text-gray-600 mb-4">
          {language === 'ar' ? 'ما هي المشكلة في هذا السؤال؟' : 'What is the issue with this question?'}
        </p>
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-xl mb-4 h-32"
          placeholder={language === 'ar' ? 'اكتب وصف المشكلة...' : 'Describe the issue...'}
        />
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowReportModal(false)}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold"
          >
            {language === 'ar' ? 'الغاء' : 'Cancel'}
          </button>
          <button
            onClick={() => {
              setShowReportModal(false);
              alert(language === 'ar' ? 'تم ارسال الابلاغ، شكراً!' : 'Report sent, thank you!');
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold"
          >
            {language === 'ar' ? 'ارسال' : 'Send'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmExit}
        onClose={() => setShowConfirmExit(false)}
        title={language === 'ar' ? 'تأكيد الخروج' : 'Confirm Exit'}
        icon="⚠️"
      >
        <p className="text-gray-600 mb-6">
          {language === 'ar'
            ? 'هل تريد حفظ التقدم ام الخروج بدون حفظ؟'
            : 'Do you want to save progress or exit without saving?'}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setShowConfirmExit(false)}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
          >
            {language === 'ar' ? 'الغاء' : 'Cancel'}
          </button>

          <button
            onClick={() => {
              saveGameState();
              onExit();
            }}
            className="px-6 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold hover:bg-[#5D3A1A] transition-colors"
          >
            {language === 'ar' ? 'حفظ وخروج' : 'Save & Exit'}
          </button>

          <button
            onClick={() => {
              void abandonGameInBackend();
              onExit();
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            {language === 'ar' ? 'خروج بدون حفظ' : 'Exit Without Save'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmEnd}
        onClose={() => setShowConfirmEnd(false)}
        title={language === 'ar' ? 'انهاء اللعبة' : 'End Game'}
        icon="🏁"
      >
        <p className="text-gray-600 mb-6">
          {language === 'ar' ? 'هل انت متأكد من انهاء اللعبة؟' : 'Are you sure you want to end the game?'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowConfirmEnd(false)}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-colors"
          >
            {language === 'ar' ? 'الغاء' : 'Cancel'}
          </button>

          <button
            onClick={() => {
              void finishGame(gameState.team1.score, gameState.team2.score);
            }}
            className="px-6 py-3 bg-[#8B5A2B] text-white rounded-xl font-bold hover:bg-[#5D3A1A] transition-colors"
          >
            {t('endGame', language)}
          </button>
        </div>
      </Modal>
    </div>
  );
}
