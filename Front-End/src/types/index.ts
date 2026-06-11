// Language Types
export type Language = 'ar' | 'en';

// User Types
export interface User {
  id: string | number;
  username: string;
  email: string;
  full_name?: string;
  fullName?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'editor';
  available_games?: number;
  gamesPurchased?: number;
  gamesPlayed?: number;
  is_active?: boolean;
  created_at?: string;
  createdAt?: string;
  last_login?: string;
  password?: string;
}

// Category Types
export interface Category {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  name_en?: string;
  description?: {
    ar: string;
    en: string;
  };
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

// Question Types
export interface Question {
  id: string;
  category_id?: string;
  text?: string;
  answer?: string | { ar: string; en: string };
  question?: {
    ar: string;
    en: string;
  };
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  image?: string;
  image_url?: string;
  answerImage?: string;
  time_limit?: number;
  is_active?: boolean;
  category_name?: string;
  category_color?: string;
}

// Legacy Question Type (for compatibility)
export interface LegacyQuestion {
  id: string;
  categoryId: string;
  question: {
    ar: string;
    en: string;
  };
  answer: {
    ar: string;
    en: string;
  };
  points: 200 | 400 | 600;
  image?: string;
  answerImage?: string;
  type: 'text' | 'image' | 'multiple';
  options?: {
    ar: string[];
    en: string[];
  };
}

// Game Config Types
export interface GameConfig {
  sessionName: string;
  playerCount: number;
  team1Name: string;
  team2Name: string;
  team1Powerups: string[];
  team2Powerups: string[];
}

// Team Types
export interface Team {
  id: number;
  name: string;
  color: string;
  score: number;
}

// Game Session Types
export interface GameSession {
  id: number;
  user_id: number;
  name?: string;
  team_count: number;
  teams: Team[];
  questions_per_category: number;
  current_question: number;
  status: 'active' | 'paused' | 'completed';
  categories?: Category[];
  questions?: GameQuestion[];
  created_at?: string;
}

// Game Question Types
export interface GameQuestion {
  id: number;
  question_id: number;
  question_text: string;
  answer_text: string;
  points: number;
  category_name: string;
  category_color: string;
  image_url?: string;
  is_answered: boolean;
  answered_by?: number;
  is_correct?: boolean;
}

// Game State Types
export interface GameState {
  team1: {
    score: number;
    powerUps: Record<string, boolean>;
  };
  team2: {
    score: number;
    powerUps: Record<string, boolean>;
  };
  currentTurn: 1 | 2;
  currentQuestion: CurrentQuestion | null;
  doublePoints: boolean;
  blockedTeam: number | null;
  timeLeft: number;
  answeredQuestions: number;
}

export interface CurrentQuestion {
  catIndex: number;
  qIndex: number;
  team: 1 | 2;
  points: number;
  catName: string;
  question: LegacyQuestion;
}

// PowerUp Types
export interface PowerUp {
  id: string;
  icon: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
}

// Powerup API Type
export interface Powerup {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  effect_type: string;
  effect_value: number;
  price: number;
  is_active: boolean;
}

// Store Item Types
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

// Order Types
export interface Order {
  id: number;
  user_id: number;
  item_id: number;
  item_type: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  userGrowth: string;
  totalCategories: number;
  totalQuestions: number;
  totalPurchases: number;
  totalRevenue: number;
  purchaseGrowth: string;
  activeGames: number;
  gameGrowth: string;
}

// Site Setting Types
export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

// Translation Types
export interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
