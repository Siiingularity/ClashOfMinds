import React, { useEffect, useState } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, useNavigate,
  useLocation
} from 'react-router-dom';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LandingPage }        from '@/sections/LandingPage';
import { AuthScreen }         from '@/sections/AuthScreen';
import { GameSetup, type GameConfig } from '@/sections/GameSetup';
import { CategorySelection }  from '@/sections/CategorySelection';
import { CategoriesPage }     from '@/sections/CategoriesPage';
import { GameScreen }         from '@/sections/GameScreen';
import { ResultScreen }       from '@/sections/ResultScreen';
import { AccountPage }        from '@/sections/AccountPage';
import { HowToPlay }          from '@/sections/HowToPlay';
import { StorePage }          from '@/sections/StorePage';
import { DashboardPage }      from '@/sections/DashboardPage';
import { MobileDrawingPage }  from '@/sections/MobileDrawingPage';
import type { Category }      from '@/types';

/* ─── Guards ──────────────────────────────────────────── */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const role = user?.role as string | undefined;
  return (role === 'admin' || role === 'editor')
    ? children
    : <Navigate to="/" replace />;
}

/* ─── Individual page wrappers ────────────────────────── */

function LandingRoute() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [savedGameState, setSavedGameState] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedGame');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) setSavedGameState(parsed);
      else localStorage.removeItem('savedGame');
    }
  }, []);

  return (
    <LandingPage
      onLoginClick={() => navigate('/auth')}
      onCreateGameClick={() => user ? navigate('/select-categories') : navigate('/auth')}
      user={user}
      onLogout={() => { logout(); navigate('/'); }}
      onAccountClick={() => navigate('/account')}
      onHowToPlayClick={() => navigate('/how-to-play')}
      onCategoriesClick={() => navigate('/categories')}
      onStoreClick={() => navigate('/store')}
      onDashboardClick={(['admin','editor'] as string[]).includes(user?.role ?? '') ? () => navigate('/dashboard') : undefined}
      hasSavedGame={!!savedGameState}
    />
  );
}

function SelectCategoriesRoute() {
  const navigate = useNavigate();
  return (
    <CategorySelection
      onBack={() => navigate('/')}
      onStart={(categories: Category[]) =>
        navigate('/setup', { state: { categories } })
      }
    />
  );
}

function SetupRoute() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const categories = location.state?.categories as Category[] | undefined;

  if (!categories?.length) return <Navigate to="/select-categories" replace />;

  return (
    <GameSetup
      onBack={() => navigate('/select-categories')}
      onNext={(config: GameConfig) =>
        navigate('/game', { state: { config, categories } })
      }
    />
  );
}

function GameRoute() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const config    = location.state?.config    as GameConfig  | undefined;
  const categories = location.state?.categories as Category[] | undefined;
  const savedGameState = location.state?.savedGameState;

  if (!config || !categories?.length) return <Navigate to="/setup" replace />;

  return (
    <GameScreen
      categories={categories}
      config={config}
      savedGameState={savedGameState?.gameState}
      onExit={() => navigate('/')}
      onEnd={(winner, team1Score, team2Score) => {
        localStorage.removeItem('savedGame');
        navigate('/results', { state: { winner, team1Score, team2Score, config } });
      }}
    />
  );
}

function ResultsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { winner, team1Score, team2Score, config } = location.state || {};

  if (!config) return <Navigate to="/" replace />;

  return (
    <ResultScreen
      winner={winner}
      team1Name={config.team1Name}
      team2Name={config.team2Name}
      team1Score={team1Score}
      team2Score={team2Score}
      onNewGame={() => {
        localStorage.removeItem('savedGame');
        navigate('/');
      }}
    />
  );
}

/* ─── Root App ────────────────────────────────────────── */
function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
      <Routes>
        <Route path="/"                  element={<LandingRoute />} />
        <Route path="/auth"              element={<AuthScreen onBack={() => history.back()} onLoginSuccess={() => history.back()} />} />
        <Route path="/how-to-play"       element={<HowToPlay onBack={() => history.back()} />} />
        <Route path="/categories"        element={<CategoriesPage onBack={() => history.back()} />} />
        <Route path="/store"             element={<StorePage onBack={() => history.back()} user={user} />} />
        <Route path="/account"           element={<RequireAuth><AccountPage user={user!} onBack={() => history.back()} onResumeGame={() => history.back()} onLogout={() => { window.location.href = '/'; }} /></RequireAuth>} />
        <Route path="/select-categories" element={<RequireAuth><SelectCategoriesRoute /></RequireAuth>} />
        <Route path="/setup"             element={<RequireAuth><SetupRoute /></RequireAuth>} />
        <Route path="/game"              element={<RequireAuth><GameRoute /></RequireAuth>} />
        <Route path="/results"           element={<RequireAuth><ResultsRoute /></RequireAuth>} />
        <Route path="/dashboard"         element={<RequireAdmin><DashboardPage onBack={() => history.back()} /></RequireAdmin>} />
        <Route path="/dashboard/:tab"      element={<RequireAdmin><DashboardPage onBack={() => history.back()} /></RequireAdmin>} />
        <Route path="/draw/:sessionId"   element={<MobileDrawingPage />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
