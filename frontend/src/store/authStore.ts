import { create } from 'zustand';
import { User } from '../types';
import api, { getErrorMessage } from '../lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  university?: string;
}

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('campusride_token');
    const userStr = localStorage.getItem('campusride_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const { token: storedToken, user: storedUser } = getStoredAuth();

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('campusride_token', data.token);
      localStorage.setItem('campusride_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.post('/auth/register', data);
      localStorage.setItem('campusride_token', res.token);
      localStorage.setItem('campusride_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('campusride_token');
    localStorage.removeItem('campusride_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('campusride_user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('campusride_token');
      localStorage.removeItem('campusride_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateUser: (user) => {
    localStorage.setItem('campusride_user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
