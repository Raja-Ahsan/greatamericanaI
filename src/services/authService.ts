import { User } from '../types';
import api, { setToken, removeToken } from '../utils/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'vendor' | 'customer';
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

class AuthService {
  // Register a new user
  async register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.post<AuthResponse>('/register', data);
      
      if (response.success && response.user && response.token) {
        setToken(response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  // Login user
  async login(data: LoginData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.post<AuthResponse>('/login', data);
      
      if (response.success && response.user && response.token) {
        setToken(response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error || 'Invalid credentials' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      localStorage.removeItem('current_user');
    }
  }

  // Get current logged in user
  getCurrentUser(): User | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  // Check authentication with backend
  async checkAuth(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    
    // If no token, don't make API call
    if (!token) {
      removeToken();
      localStorage.removeItem('current_user');
      return null;
    }

    try {
      const response = await api.get<{ success: boolean; user?: User }>('/me');
      
      if (response.success && response.user) {
        localStorage.setItem('current_user', JSON.stringify(response.user));
        return response.user;
      }
      
      // If check fails, clear local storage
      removeToken();
      localStorage.removeItem('current_user');
      return null;
    } catch (error: any) {
      // Token invalid or expired - silently fail without redirect
      // The API utility will handle redirects only when appropriate
      removeToken();
      localStorage.removeItem('current_user');
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.put<AuthResponse>('/profile', updates);
      
      if (response.success && response.user) {
        localStorage.setItem('current_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      
      return { success: false, error: response.error || 'Update failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && localStorage.getItem('auth_token') !== null;
  }
}

export const authService = new AuthService();
