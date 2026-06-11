import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  startRegister: (data: { username: string; email: string; phone: string; password: string }) => Promise<any>;
  verifyRegister: (data: { phone: string; otp: string }) => Promise<any>;
  resendRegisterOtp: (phone: string) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const normalizeRole = (role: unknown): 'user' | 'admin' | 'editor' => {
  if (role === 'admin') return 'admin';
  if (role === 'editor') return 'editor';
  return 'user';
};

const normalizeId = (v: unknown): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return isFinite(n) ? n : null;
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await storage.getItem('token');
      if (!token) { setIsLoading(false); return; }
      await fetchProfile();
    })();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      const src = (res as any)?.data ?? res;
      const id = normalizeId(src?.userId ?? src?.id);
      if (id && src?.username && src?.email) {
        setUser({
          id,
          username: src.username,
          email: src.email,
          phone: src.phone,
          role: normalizeRole(src.role),
          available_games: src.available_games,
          games_played: src.games_played,
          games_won: src.games_won,
          total_score: src.total_score,
        });
      } else {
        await storage.removeItem('token');
        setUser(null);
      }
    } catch {
      await storage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authAPI.login(identifier, password);
      const src = (res as any)?.data ?? res;
      const token = src?.token;
      const id = normalizeId(src?.userId ?? src?.id);
      if (token && id && src?.username) {
        await storage.setItem('token', token);
        setUser({
          id,
          username: src.username,
          email: src.email,
          phone: src.phone,
          role: normalizeRole(src.role),
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (e: any) {
      const msg = e?.message || 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const startRegister = async (data: { username: string; email: string; phone: string; password: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authAPI.startRegister(data);
      if (!(res as any).success) throw new Error((res as any).message || 'Failed');
      return res;
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegister = async (data: { phone: string; otp: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authAPI.verifyRegister(data);
      if (!(res as any).success) throw new Error((res as any).message || 'Verification failed');
      return res;
    } catch (e: any) {
      setError(e?.message || 'Verification failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const resendRegisterOtp = async (phone: string) => {
    setError(null);
    try {
      return await authAPI.resendRegisterOtp(phone);
    } catch (e: any) {
      setError(e?.message || 'Failed to resend OTP');
      throw e;
    }
  };

  const logout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('currentGameId');
    await storage.removeItem('savedGame');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        startRegister,
        verifyRegister,
        resendRegisterOtp,
        logout,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
