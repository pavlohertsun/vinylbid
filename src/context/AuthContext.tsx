import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [user, setUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('vinylbid_user');
    if (savedId) return INITIAL_USERS.find(u => u.id === parseInt(savedId)) ?? null;
    return null;
  });

  const login = (email: string, password: string): boolean => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('vinylbid_user', String(found.id));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vinylbid_user');
  };

  const register = (name: string, email: string, password: string, role: 'buyer' | 'seller'): boolean => {
    if (users.some(u => u.email === email)) return false;
    const newUser: User = {
      id: Date.now(),
      name, email, password, role,
      rating: 0, ratingCount: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('vinylbid_user', String(newUser.id));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
