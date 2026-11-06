import { create } from 'zustand';
import { getUserByEmail, updateUser } from '../lib/store';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  avatar?: string;
  phone?: string;
}

export const DEFAULT_ADMIN: User = {
  _id: 'admin1',
  name: 'System Admin',
  email: 'admin@boatcompany.com',
  role: 'admin',
};

export const DEFAULT_MANAGER: User = {
  _id: 'mgr1',
  name: 'Capt. M. Madhukar Rao',
  email: 'manager@boatcompany.com',
  role: 'manager',
  phone: '9553464475',
};

const getStoredUser = (): User => {
  try {
    const str = localStorage.getItem('marine_current_user');
    if (str) {
      const parsed = JSON.parse(str);
      if (parsed && parsed.email && parsed.role) {
        return parsed;
      }
    }
  } catch {}
  localStorage.setItem('marine_current_user', JSON.stringify(DEFAULT_ADMIN));
  return DEFAULT_ADMIN;
};

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  switchRole: (role: 'admin' | 'manager') => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = getStoredUser();

  return {
    user: initialUser,
    isAuthenticated: true,
    isLoading: false,

    login: async (email, password) => {
      set({ isLoading: true });
      await new Promise(r => setTimeout(r, 200));
      const u = getUserByEmail(email);
      if (!u || !u.isActive) {
        set({ isLoading: false });
        throw new Error('Invalid credentials or account deactivated');
      }
      if (u.password !== password) {
        set({ isLoading: false });
        throw new Error('Invalid email or password');
      }
      updateUser(u._id, { lastLogin: new Date().toISOString() });
      const user: User = { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, phone: u.phone };
      localStorage.setItem('marine_current_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    },

    switchRole: (role: 'admin' | 'manager') => {
      const targetUser = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_MANAGER;
      localStorage.setItem('marine_current_user', JSON.stringify(targetUser));
      set({ user: targetUser, isAuthenticated: true });
    },

    logout: () => {
      // Instead of forcing login screen, reset to default admin or clear
      localStorage.removeItem('marine_current_user');
      set({ user: DEFAULT_ADMIN, isAuthenticated: true });
      window.location.href = '/login';
    },

    checkAuth: () => {
      const current = getStoredUser();
      set({ user: current, isAuthenticated: true });
    },
  };
});
