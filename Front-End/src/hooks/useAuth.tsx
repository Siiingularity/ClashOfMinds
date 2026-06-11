import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'editor';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  startRegister: (data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<any>;
  verifyRegister: (data: { phone: string; otp: string }) => Promise<any>;
  resendRegisterOtp: (phone: string) => Promise<any>;
  logout: () => void;
  error: string | null;
}

interface AuthApiResponse {
  token?: string;
  id?: number | string;
  userId?: number | string;
  username?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin' | string;
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    id?: number | string;
    userId?: number | string;
    username?: string;
    email?: string;
    phone?: string;
    role?: 'user' | 'admin' | string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

const normalizeRole = (role: unknown): 'user' | 'admin' | 'editor' => {
  if (role === 'admin') return 'admin';
  if (role === 'editor') return 'editor';
  return 'user';
};

const normalizeUserId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeAuthResponse = (response: AuthApiResponse) => {
  const source = response?.data ?? response ?? {};

  return {
    token: source.token,
    userId: normalizeUserId(source.userId ?? source.id),
    username: source.username,
    email: source.email,
    phone: source.phone,
    role: normalizeRole(source.role),
  };
};

const normalizeProfileResponse = (response: unknown): User | null => {
  if (!response || typeof response !== 'object') return null;

  const maybeResponse = response as {
    success?: boolean;
    data?: {
      id?: number | string;
      userId?: number | string;
      username?: string;
      email?: string;
      phone?: string;
      role?: string;
    };
  };

  if (!maybeResponse.success || !maybeResponse.data) return null;

  const userId = normalizeUserId(maybeResponse.data.userId ?? maybeResponse.data.id);

  if (!userId || !maybeResponse.data.username || !maybeResponse.data.email) {
    return null;
  }

  return {
    id: userId,
    username: maybeResponse.data.username,
    email: maybeResponse.data.email,
    phone: maybeResponse.data.phone,
    role: normalizeRole(maybeResponse.data.role),
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      await fetchProfile();
    };

    void initializeAuth();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const normalizedUser = normalizeProfileResponse(response);

      if (normalizedUser) {
        setUser(normalizedUser);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = (await authAPI.login(identifier, password)) as AuthApiResponse;
      const normalized = normalizeAuthResponse(response);

      if (
        normalized.token &&
        normalized.userId &&
        normalized.username &&
        normalized.email
      ) {
        localStorage.setItem('token', normalized.token);

        setUser({
          id: normalized.userId,
          username: normalized.username,
          email: normalized.email,
          phone: normalized.phone,
          role: normalized.role,
        });

        return;
      }

      throw new Error(response?.message || 'Login failed');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Invalid username or password');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startRegister = async (data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authAPI.startRegister(data);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }

      return response;
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegister = async (data: { phone: string; otp: string }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authAPI.verifyRegister(data);

      if (!response.success) {
        throw new Error(response.message || 'Verification failed');
      }

      return response;
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Verification failed');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendRegisterOtp = async (phone: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authAPI.resendRegisterOtp({ phone });

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend OTP');
      }

      return response;
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to resend OTP');
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        startRegister,
        verifyRegister,
        resendRegisterOtp,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
