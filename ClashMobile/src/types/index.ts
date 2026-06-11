export type Language = 'ar' | 'en';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'editor';
  available_games?: number;
  games_played?: number;
  games_won?: number;
  total_score?: number;
}

export interface Category {
  id: string | number;
  name: { ar: string; en: string } | string;
  name_ar?: string;
  name_en?: string;
  description?: { ar: string; en: string };
  color?: string;
  icon?: string;
  image?: string;
  image_url?: string;
  count?: number;
  question_count?: number;
  display_order?: number;
  is_active?: boolean;
  section?: string;
  isDrawing?: boolean;
}

export interface Question {
  id: string;
  category_id?: string;
  question?: { ar: string; en: string };
  text?: string;
  answer?: string | { ar: string; en: string };
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  image?: string;
  image_url?: string;
  answerImage?: string;
  answer_image_url?: string;
  time_limit?: number;
  is_active?: boolean;
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

export interface Team {
  id: number;
  name: string;
  color: string;
  score: number;
}

export interface GameState {
  team1: { score: number; powerUps: Record<string, boolean> };
  team2: { score: number; powerUps: Record<string, boolean> };
  currentTurn: 1 | 2;
  answeredQuestions: string[];
  doublePoints: boolean;
  blockedTeam: number | null;
}

export interface PowerUp {
  id: string;
  icon: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
}

export interface StoreItem {
  id: number;
  name: string;
  description?: string;
  type: 'games' | 'powerups' | 'subscription';
  quantity: number;
  price: number;
  original_price?: number;
  image_url?: string;
  features?: string[];
  is_featured: boolean;
  is_active: boolean;
}

export interface GameSession {
  id: number;
  session_name: string;
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  winner?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  HowToPlay: undefined;
  Categories: undefined;
  Store: undefined;
  Account: undefined;
  CategorySelection: undefined;
  GameSetup: { categories: Category[] };
  Game: { config: GameConfig; categories: Category[] };
  Result: { winner: string; team1Score: number; team2Score: number; config: GameConfig };
  Dashboard: undefined;
  Drawing: { sessionId: string };
};
