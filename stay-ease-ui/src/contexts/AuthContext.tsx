import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/mockApi';
import type { User, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  isRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('stayease_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('stayease_user', JSON.stringify(user));
    else localStorage.removeItem('stayease_user');
  }, [user]);

  const login = async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
  };
  const register = async (email: string, password: string, name: string) => {
    const u = await api.register(email, password, name);
    setUser(u);
  };
  const logout = () => setUser(null);
  const isRole = (role: Role) => user?.role === role;

  return <AuthContext.Provider value={{ user, login, logout, register, isRole }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
