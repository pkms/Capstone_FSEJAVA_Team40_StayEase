import { createContext, useContext, useState } from 'react';
import * as api from '../api/mockApi';
import { getToken, getStoredRole, clearToken, decodeToken } from '../api/client';
import type { User, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  isRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Rebuilds a minimal User from whatever's already in storage, so a page refresh
// doesn't log the user out. The JWT itself only carries the email — role is
// stored separately (set at login time) since the backend returns it alongside
// the token rather than inside it. `name` is still a placeholder derived from
// the email, since the backend doesn't return a display name on login.
function userFromStoredToken(): User | null {
  const token = getToken();
  if (!token) return null;
  const claims = decodeToken(token);
  if (!claims?.sub) return null;
  const role = (getStoredRole() as Role) ?? 'GUEST';
  return { id: claims.sub, email: claims.sub, name: claims.sub.split('@')[0], role };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => userFromStoredToken());

  const login = async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
  };
  const register = async (email: string, password: string, name: string) => {
    const u = await api.register(email, password, name);
    setUser(u);
  };
  const logout = () => {
    clearToken();
    setUser(null);
  };
  const isRole = (role: Role) => user?.role === role;

  return <AuthContext.Provider value={{ user, login, logout, register, isRole }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}