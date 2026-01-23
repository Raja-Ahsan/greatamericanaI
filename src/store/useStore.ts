import { create } from 'zustand';
import { Agent, CartItem, User } from '../types';
import { authService } from '../services/authService';
import { userDataService } from '../services/userDataService';

interface Store {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  
  // Cart actions
  addToCart: (agent: Agent) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  
  // Purchase action
  completePurchase: () => Promise<{ success: boolean; error?: string }>;
}

// Initialize auth state from localStorage
const getInitialAuthState = () => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('current_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, isAuthenticated: true };
    } catch (e) {
      return { user: null, isAuthenticated: false };
    }
  }
  
  return { user: null, isAuthenticated: false };
};

const initialAuth = getInitialAuthState();

export const useStore = create<Store>((set, get) => ({
  cart: [],
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  loading: false,

  // Check if user is authenticated on app load
  checkAuth: async () => {
    set({ loading: true });
    try {
      const user = await authService.checkAuth();
      if (user) {
        set({ user, isAuthenticated: true });
        await get().loadCart();
      } else {
        set({ user: null, isAuthenticated: false, cart: [] });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, isAuthenticated: false, cart: [] });
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const result = await authService.login({ email, password });
      
      if (result.success && result.user) {
        set({ user: result.user, isAuthenticated: true });
        await get().loadCart();
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      set({ loading: false });
    }
  },

  // Register
  register: async (name: string, email: string, password: string) => {
    set({ loading: true });
    try {
      const result = await authService.register({ name, email, password });
      
      if (result.success && result.user) {
        set({ user: result.user, isAuthenticated: true });
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false, cart: [] });
      set({ loading: false });
    }
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    const state = get();
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    set({ loading: true });
    try {
      const result = await authService.updateProfile(updates);
      
      if (result.success && result.user) {
        set({ user: result.user, isAuthenticated: true });
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' };
    } finally {
      set({ loading: false });
    }
  },

  // Load cart from API
  loadCart: async () => {
    try {
      const cart = await userDataService.getCart();
      set({ cart });
    } catch (error) {
      console.error('Error loading cart:', error);
      set({ cart: [] });
    }
  },

  // Add to cart
  addToCart: async (agent: Agent) => {
    const state = get();
    if (!state.user) {
      return;
    }

    try {
      const success = await userDataService.addToCart(agent.id.toString(), 1);
      if (success) {
        await get().loadCart(); // Reload cart from API
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  },

  // Remove from cart
  removeFromCart: async (cartItemId: string) => {
    const state = get();
    if (!state.user) return;

    try {
      const success = await userDataService.removeFromCart(cartItemId);
      if (success) {
        await get().loadCart(); // Reload cart from API
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  },

  // Update quantity
  updateQuantity: async (cartItemId: string, quantity: number) => {
    const state = get();
    if (!state.user) return;

    if (quantity <= 0) {
      await get().removeFromCart(cartItemId);
      return;
    }

    try {
      const success = await userDataService.updateCartItem(cartItemId, quantity);
      if (success) {
        await get().loadCart(); // Reload cart from API
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  },

  // Clear cart
  clearCart: async () => {
    const state = get();
    if (!state.user) return;

    try {
      const success = await userDataService.clearCart();
      if (success) {
        set({ cart: [] });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },

  // Get total price
  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.agent.price * item.quantity, 0);
  },

  // Get total items
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Complete purchase
  completePurchase: async () => {
    const state = get();
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    set({ loading: true });
    try {
      const success = await userDataService.completePurchase();
      
      if (success) {
        set({ cart: [] });
        return { success: true };
      }
      
      return { success: false, error: 'Purchase failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Purchase failed' };
    } finally {
      set({ loading: false });
    }
  },
}));
