import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    invitation_code: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const hasToken = await api.hasValidToken();
      if (hasToken) {
        const user = await api.getProfile();
        set({ user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      await api.clearTokens();
      set({ isInitialized: true, isAuthenticated: false, user: null });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Identifiants incorrects';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || "Erreur lors de l'inscription";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
