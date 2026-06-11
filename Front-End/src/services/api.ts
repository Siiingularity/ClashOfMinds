// API Service for Clash of Minds Backend

import { API_URL } from '../config/api';
const API_BASE_URL = `${API_URL}/api`;

// Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  games_played: number;
  games_won: number;
  total_score: number;
  created_at: string;
  last_login?: string;
}

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  section: string;
  image_url: string;
  is_active: boolean;
  question_count: number;
  actual_question_count?: number;
}

export interface Question {
  id: number;
  category_id: number;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  points: 200 | 400 | 600;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url?: string;
  answer_image_url?: string;
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
  ended_at?: string;
}

export interface StartRegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyRegisterData {
  phone: string;
  otp: string;
}

export interface ResendRegisterOtpData {
  phone: string;
}

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  startRegister: (data: StartRegisterData) =>
    apiRequest<{ phone: string; devOtp?: string }>('/auth/start-register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  verifyRegister: (data: VerifyRegisterData) =>
    apiRequest<{ userId: number }>('/auth/verify-register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resendRegisterOtp: (data: ResendRegisterOtpData) =>
    apiRequest<{ phone: string; devOtp?: string }>('/auth/resend-register-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  register: (username: string, email: string, password: string) =>
    apiRequest<{ userId: number; username: string; email: string; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),

  login: (identifier: string, password: string) =>
    apiRequest<{ userId: number; username: string; email: string; phone?: string; role: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername: identifier, password })
    }),

  getProfile: () =>
    apiRequest<User>('/auth/profile'),

  updateProfile: (updates: { username?: string; email?: string; phone?: string }) =>
    apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    })
};

// Users API
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiRequest<{ users: User[]; pagination: any }>(`/users?${new URLSearchParams(params as any).toString()}`),

  getById: (id: number) =>
    apiRequest<User>(`/users/${id}`),

  update: (id: number, updates: any) =>
    apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  delete: (id: number) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE'
    }),

  getLeaderboard: (limit?: number) =>
    apiRequest<any[]>(`/users/leaderboard?${limit ? `limit=${limit}` : ''}`),

  getStats: () =>
    apiRequest('/users/stats')
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: { section?: string; search?: string; includeInactive?: boolean }) =>
    apiRequest<Category[]>(`/categories?${new URLSearchParams(params as any).toString()}`),

  getBySection: () =>
    apiRequest<Record<string, Category[]>>('/categories/by-section'),

  getById: (id: number) =>
    apiRequest<Category>(`/categories/${id}`),

  getRandom: (count?: number) =>
    apiRequest<Category[]>(`/categories/random?${count ? `count=${count}` : ''}`),

  create: (data: Partial<Category>) =>
    apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: number, data: Partial<Category>) =>
    apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: number) =>
    apiRequest(`/categories/${id}`, {
      method: 'DELETE'
    }),

  toggle: (id: number) =>
    apiRequest<Category>(`/categories/${id}/toggle`, {
      method: 'PATCH'
    }),

  getStats: () =>
    apiRequest('/categories/stats')
};

// Questions API
export const questionsAPI = {
  getAll: (params?: { page?: number; limit?: number; categoryId?: number; difficulty?: string; points?: number; search?: string }) =>
    apiRequest<{ questions: Question[]; pagination: any }>(`/questions?${new URLSearchParams(params as any).toString()}`),

  getByCategory: (categoryId: number) =>
    apiRequest<Question[]>(`/questions/category/${categoryId}`),

  getById: (id: number) =>
    apiRequest<Question>(`/questions/${id}`),

  getRandom: (categoryIds: number[], questionsPerCategory?: number) =>
    apiRequest('/questions/random', {
      method: 'POST',
      body: JSON.stringify({ categoryIds, questionsPerCategory })
    }),

  create: (data: Partial<Question>) =>
    apiRequest<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  createBulk: (questions: Partial<Question>[]) =>
    apiRequest('/questions/bulk', {
      method: 'POST',
      body: JSON.stringify({ questions })
    }),

  update: (id: number, data: Partial<Question>) =>
    apiRequest<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: number) =>
    apiRequest(`/questions/${id}`, {
      method: 'DELETE'
    }),

  toggle: (id: number) =>
    apiRequest<Question>(`/questions/${id}/toggle`, {
      method: 'PATCH'
    }),

  getStats: () =>
    apiRequest('/questions/stats')
};

// Games API
export const gamesAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiRequest<{ sessions: GameSession[]; pagination: any }>(`/games?${new URLSearchParams(params as any).toString()}`),

  getMyGames: (params?: { page?: number; limit?: number }) =>
    apiRequest<{ sessions: GameSession[]; pagination: any }>(`/games/my-games?${new URLSearchParams(params as any).toString()}`),

  getById: (id: number) =>
    apiRequest<GameSession>(`/games/${id}`),

  create: (data: { sessionName?: string; team1Name: string; team2Name: string }) =>
    apiRequest<GameSession>('/games', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateScores: (id: number, scores: { team1Score: number; team2Score: number }) =>
    apiRequest<GameSession>(`/games/${id}/scores`, {
      method: 'PUT',
      body: JSON.stringify(scores)
    }),

  recordQuestion: (id: number, data: { questionId: number; askedByTeam: number; answeredByTeam?: number; isCorrect?: boolean; pointsEarned?: number }) =>
    apiRequest(`/games/${id}/record-question`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  end: (id: number, winner?: string) =>
    apiRequest<GameSession>(`/games/${id}/end`, {
      method: 'POST',
      body: JSON.stringify({ winner })
    }),

  abandon: (id: number) =>
    apiRequest<GameSession>(`/games/${id}/abandon`, {
      method: 'POST'
    }),

  delete: (id: number) =>
    apiRequest(`/games/${id}`, {
      method: 'DELETE'
    }),

  getLeaderboard: (limit?: number) =>
    apiRequest(`/games/leaderboard?${limit ? `limit=${limit}` : ''}`),

  getDashboardStats: () =>
    apiRequest('/games/dashboard/stats')
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export const siteSettingsAPI = {
  getAll: () => apiRequest<any[]>('/site-settings'),
  get: (key: string) => apiRequest<any>(`/site-settings/${key}`),
  set: (key: string, value: string) =>
    apiRequest<any>('/site-settings', { method: 'POST', body: JSON.stringify({ key, value }) }),
  delete: (key: string) => apiRequest(`/site-settings/${key}`, { method: 'DELETE' }),
};

export default {
  auth: authAPI,
  users: usersAPI,
  categories: categoriesAPI,
  questions: questionsAPI,
  games: gamesAPI,
  healthCheck
};

// Sections API
export const sectionsAPI = {
  getAll: (params?: { includeInactive?: boolean }) =>
    apiRequest<any[]>(`/sections${params?.includeInactive ? '?includeInactive=true' : ''}`),

  getById: (id: number) =>
    apiRequest<any>(`/sections/${id}`),

  create: (data: { nameAr: string; nameEn: string; slug: string; displayOrder?: number }) =>
    apiRequest<any>('/sections', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: number, data: Partial<{ nameAr: string; nameEn: string; slug: string; displayOrder: number; isActive: boolean }>) =>
    apiRequest<any>(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: number, force?: boolean, reassignTo?: string) => {
    let url = `/sections/${id}`;
    const params = new URLSearchParams();
    if (force) params.append('force', 'true');
    if (reassignTo) params.append('reassignTo', reassignTo);
    if (params.toString()) url += `?${params.toString()}`;
    return apiRequest(url, { method: 'DELETE' });
  },

  toggle: (id: number) =>
    apiRequest<any>(`/sections/${id}/toggle`, { method: 'PATCH' })
};
