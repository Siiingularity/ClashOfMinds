import { storage } from '../utils/storage';

export const API_URL = 'https://clashofminds-production.up.railway.app';
const API_BASE = `${API_URL}/api`;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = await storage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (identifier: string, password: string) =>
    request<{ token: string; userId: number; username: string; email: string; phone?: string; role: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ emailOrUsername: identifier, password }) }
    ),

  startRegister: (data: { username: string; email: string; phone: string; password: string }) =>
    request<{ phone: string; devOtp?: string }>('/auth/start-register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyRegister: (data: { phone: string; otp: string }) =>
    request<{ userId: number }>('/auth/verify-register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendRegisterOtp: (phone: string) =>
    request<{ phone: string }>('/auth/resend-register-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  getProfile: () => request<any>('/auth/profile'),

  updateProfile: (updates: { username?: string; email?: string; phone?: string }) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Categories ──────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: (params?: { section?: string; search?: string; includeInactive?: boolean }) => {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    return request<any[]>(`/categories?${q}`);
  },

  getBySection: () => request<Record<string, any[]>>('/categories/by-section'),

  getById: (id: number | string) => request<any>(`/categories/${id}`),
};

// ─── Questions ───────────────────────────────────────────────────────
export const questionsAPI = {
  getAll: (params?: any) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return request<{ questions: any[]; pagination: any }>(`/questions?${q}`);
  },

  getByCategory: (categoryId: number | string) =>
    request<any[]>(`/questions/category/${categoryId}`),

  getById: (id: number | string) => request<any>(`/questions/${id}`),

  getRandom: (categoryIds: number[], questionsPerCategory?: number) =>
    request('/questions/random', {
      method: 'POST',
      body: JSON.stringify({ categoryIds, questionsPerCategory }),
    }),
};

// ─── Games ───────────────────────────────────────────────────────────
export const gamesAPI = {
  create: (data: { sessionName?: string; team1Name: string; team2Name: string }) =>
    request<any>('/games', { method: 'POST', body: JSON.stringify(data) }),

  getMyGames: (params?: { page?: number; limit?: number }) => {
    const q = params ? new URLSearchParams(params as any).toString() : '';
    return request<{ sessions: any[]; pagination: any }>(`/games/my-games?${q}`);
  },

  updateScores: (id: number, scores: { team1Score: number; team2Score: number }) =>
    request(`/games/${id}/scores`, { method: 'PUT', body: JSON.stringify(scores) }),

  end: (id: number, winner?: string) =>
    request(`/games/${id}/end`, { method: 'POST', body: JSON.stringify({ winner }) }),

  recordQuestion: (
    id: number,
    data: { questionId: number; askedByTeam: number; answeredByTeam?: number; isCorrect?: boolean; pointsEarned?: number }
  ) =>
    request(`/games/${id}/record-question`, { method: 'POST', body: JSON.stringify(data) }),

  getDashboardStats: () => request('/games/dashboard/stats'),

  getLeaderboard: (limit?: number) =>
    request(`/games/leaderboard${limit ? `?limit=${limit}` : ''}`),
};

// ─── Users ───────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params?: any) => {
    const q = params ? new URLSearchParams(params).toString() : '';
    return request<{ users: any[]; pagination: any }>(`/users?${q}`);
  },

  getById: (id: number) => request<any>(`/users/${id}`),

  update: (id: number, updates: any) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  delete: (id: number) => request(`/users/${id}`, { method: 'DELETE' }),

  getLeaderboard: (limit?: number) =>
    request<any[]>(`/users/leaderboard${limit ? `?limit=${limit}` : ''}`),

  getStats: () => request('/users/stats'),
};

// ─── Sections ────────────────────────────────────────────────────────
export const sectionsAPI = {
  getAll: (params?: { includeInactive?: boolean }) =>
    request<any[]>(`/sections${params?.includeInactive ? '?includeInactive=true' : ''}`),
};

// ─── Store ───────────────────────────────────────────────────────────
export const storeAPI = {
  getItems: () => request<any[]>('/store/items'),
  purchase: (itemId: number) =>
    request('/store/purchase', { method: 'POST', body: JSON.stringify({ itemId }) }),
};

// ─── Reports ─────────────────────────────────────────────────────────
export const reportAPI = {
  send: (data: { questionId?: string; gameId?: number; description: string }) =>
    request('/reports', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Site Settings ───────────────────────────────────────────────────
export const siteSettingsAPI = {
  getAll: () => request<any[]>('/site-settings'),
};

export default { authAPI, categoriesAPI, questionsAPI, gamesAPI, usersAPI, storeAPI, reportAPI };
