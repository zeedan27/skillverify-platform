import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, UserStatus } from '@skillverify/shared';
import api from '../api/client';

export interface UserSession {
  _id: string;
  email: string;
  role: Role;
  status: UserStatus;
  fullName?: string;
  companyName?: string;
  headline?: string;
  skills?: string[];
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  logout: () => void;
  updateUser: (updated: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('skillverify_token');
    const savedUser = localStorage.getItem('skillverify_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<UserSession> => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, tokens } = res.data.data;
    setUser(loggedInUser);
    setToken(tokens.accessToken);
    localStorage.setItem('skillverify_token', tokens.accessToken);
    localStorage.setItem('skillverify_refresh_token', tokens.refreshToken);
    localStorage.setItem('skillverify_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillverify_token');
    localStorage.removeItem('skillverify_refresh_token');
    localStorage.removeItem('skillverify_user');
    window.location.href = '/login';
  };

  const updateUser = (updated: Partial<UserSession>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('skillverify_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
