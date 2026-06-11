import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/sections/LandingPage';
import { AuthScreen } from '@/sections/AuthScreen';
import { GameSetup, type GameConfig } from '@/sections/GameSetup';
import { CategorySelection } from '@/sections/CategorySelection';
import { CategoriesPage } from '@/sections/CategoriesPage';
import { GameScreen } from '@/sections/GameScreen';
import { ResultScreen } from '@/sections/ResultScreen';
import { AccountPage } from '@/sections/AccountPage';
import { HowToPlay } from '@/sections/HowToPlay';
import { StorePage } from '@/sections/StorePage';
import { DashboardPage } from '@/sections/DashboardPage';
import { MobileDrawingPage } from '@/sections/MobileDrawingPage';
import type { Category } from '@/types';

type Screen = 'landing' | 'auth' | 'setup' | 'categories' | 'categoriesPage' | 'game' | 'results' | 'account' | 'howtoplay' | 'store' | 'dashboard';

interface GameResult {
  winner: string;
  team1Score: number;
  team2Score: number;
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [savedGameState, setSavedGameState] = useState<any>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      const parsed = JSON.parse(savedGame);
      // Check if saved game is not too old (24 hours)
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        setSavedGameState(parsed);
      } else {
        localStorage.removeItem('savedGame');
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setCurrentScreen('landing');
  };

  const handleGameSetupNext = (config: GameConfig) => {
    setGameConfig(config);
    setCurrentScreen('categories');
  };

  const handleCategorySelectionStart = (categories: Category[]) => {
    setSelectedCategories(categories);
    setCurrentScreen('game');
  };

  const handleGameEnd = (winner: string, team1Score: number, team2Score: number) => {
    setGameResult({ winner, team1Score, team2Score });
    // Clear saved game when game ends
    localStorage.removeItem('savedGame');
    setSavedGameState(null);
    setCurrentScreen('results');
  };

  const handleNewGame = () => {
    setCurrentScreen('landing');
    setGameConfig(null);
    setSelectedCategories([]);
    setGameResult(null);
    setSavedGameState(null);
    localStorage.removeItem('savedGame');
  };

  const handleResumeGame = () => {
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      const parsed = JSON.parse(savedGame);
      // Restore game config and categories from saved game
      const allCategories = JSON.parse(localStorage.getItem('allCategories') || '[]');
      const restoredCategories = parsed.categories.map((id: string) => 
        allCategories.find((c: Category) => c.id === id)
      ).filter(Boolean);
      
      setGameConfig(parsed.config);
      setSelectedCategories(restoredCategories);
      setSavedGameState(parsed);
      setCurrentScreen('game');
    }
  };

  const handleExitGame = () => {
    setCurrentScreen('landing');
    // Don't clear saved game on exit - let user resume later
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // If on mobile drawing route, don't show main app
  if (location.pathname.startsWith('/draw/')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
        <Routes>
          <Route path="/draw/:sessionId" element={<MobileDrawingPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
      {currentScreen === 'landing' && (
        <LandingPage 
          onLoginClick={() => setCurrentScreen('auth')}
          onCreateGameClick={() => user ? setCurrentScreen('setup') : setCurrentScreen('auth')}
          user={user}
          onLogout={() => {
            logout();
            setCurrentScreen('landing');
          }}
          onAccountClick={() => setCurrentScreen('account')}
          onHowToPlayClick={() => setCurrentScreen('howtoplay')}
          onCategoriesClick={() => setCurrentScreen('categoriesPage')}
          onStoreClick={() => setCurrentScreen('store')}
          onDashboardClick={isAdmin ? () => setCurrentScreen('dashboard') : undefined}
          hasSavedGame={!!savedGameState}
        />
      )}

      {currentScreen === 'howtoplay' && (
        <HowToPlay onBack={() => setCurrentScreen('landing')} />
      )}

      {currentScreen === 'categoriesPage' && (
        <CategoriesPage onBack={() => setCurrentScreen('landing')} />
      )}

      {currentScreen === 'store' && (
        <StorePage 
          onBack={() => setCurrentScreen('landing')} 
          user={user}
        />
      )}

      {currentScreen === 'dashboard' && isAdmin && (
        <DashboardPage onBack={() => setCurrentScreen('landing')} />
      )}

      {currentScreen === 'account' && user && (
        <AccountPage 
          user={user}
          onBack={() => setCurrentScreen('landing')}
          onResumeGame={handleResumeGame}
          onLogout={() => {
            logout();
            setCurrentScreen('landing');
          }}
        />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen 
          onBack={() => setCurrentScreen('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentScreen === 'setup' && (
        <GameSetup 
          onBack={() => setCurrentScreen('landing')}
          onNext={handleGameSetupNext}
        />
      )}

      {currentScreen === 'categories' && gameConfig && (
        <CategorySelection 
          onBack={() => setCurrentScreen('setup')}
          onStart={handleCategorySelectionStart}
        />
      )}

      {currentScreen === 'game' && gameConfig && selectedCategories.length > 0 && (
        <GameScreen 
          categories={selectedCategories}
          config={gameConfig}
          onExit={handleExitGame}
          onEnd={handleGameEnd}
          savedGameState={savedGameState?.gameState}
        />
      )}

      {currentScreen === 'results' && gameConfig && gameResult && (
        <ResultScreen 
          winner={gameResult.winner}
          team1Name={gameConfig.team1Name}
          team2Name={gameConfig.team2Name}
          team1Score={gameResult.team1Score}
          team2Score={gameResult.team2Score}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
