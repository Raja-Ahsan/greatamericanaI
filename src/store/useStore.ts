import { create } from 'zustand';
import { Agent, CartItem, User } from '../types';
import { authService } from '../services/authService';
import { userDataService } from '../services/userDataService';

interface Store {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => void;
  
  // Cart actions
  addToCart: (agent: Agent) => void;
  removeFromCart: (agentId: string) => void;
  updateQuantity: (agentId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  loadCart: () => void;
  
  // Purchase action
  completePurchase: () => void;
}

export const useStore = create<Store>((set, get) => ({
  cart: [],
  user: null,
  isAuthenticated: false,

  // Check if user is authenticated on app load
  checkAuth: () => {
    const user = authService.getCurrentUser();
    if (user) {
      set({ user, isAuthenticated: true });
      get().loadCart();
    }
  },

  // Login
  login: async (email: string, password: string) => {
    const result = authService.login({ email, password });
    
    if (result.success && result.user) {
      set({ user: result.user, isAuthenticated: true });
      get().loadCart();
      return { success: true };
    }
    
    return { success: false, error: result.error };
  },

  // Register
  register: async (name: string, email: string, password: string) => {
    const result = authService.register({ name, email, password });
    
    if (result.success && result.user) {
      set({ user: result.user, isAuthenticated: true });
      return { success: true };
    }
    
    return { success: false, error: result.error };
  },

  // Logout
  logout: () => {
    const state = get();
    if (state.user) {
      // Save cart before logout
      userDataService.saveCart(state.user.id, state.cart);
    }
    authService.logout();
    set({ user: null, isAuthenticated: false, cart: [] });
  },

  // Update profile
  updateProfile: async (updates: Partial<User>) => {
    const state = get();
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const result = authService.updateProfile(state.user.id, updates);
    
    if (result.success && result.user) {
      set({ user: result.user });
      return { success: true };
    }
    
    return { success: false, error: result.error };
  },

  // Load cart from localStorage for current user
  loadCart: () => {
    const state = get();
    if (state.user) {
      const cart = userDataService.getCart(state.user.id);
      set({ cart });
    }
  },

  // Add to cart
  addToCart: (agent) => {
    const state = get();
    if (!state.user) {
      // User must be logged in to add to cart
      return;
    }

    const cart = state.cart;
    const existingItem = cart.find(item => item.agent.id === agent.id);

    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map(item =>
        item.agent.id === agent.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { agent, quantity: 1 }];
    }

    set({ cart: newCart });
    userDataService.saveCart(state.user.id, newCart);
  },

  // Remove from cart
  removeFromCart: (agentId) => {
    const state = get();
    if (!state.user) return;

    const newCart = state.cart.filter(item => item.agent.id !== agentId);
    set({ cart: newCart });
    userDataService.saveCart(state.user.id, newCart);
  },

  // Update quantity
  updateQuantity: (agentId, quantity) => {
    const state = get();
    if (!state.user) return;

    if (quantity <= 0) {
      get().removeFromCart(agentId);
      return;
    }

    const newCart = state.cart.map(item =>
      item.agent.id === agentId ? { ...item, quantity } : item
    );
    
    set({ cart: newCart });
    userDataService.saveCart(state.user.id, newCart);
  },

  // Clear cart
  clearCart: () => {
    const state = get();
    if (!state.user) return;

    set({ cart: [] });
    userDataService.clearCart(state.user.id);
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
  completePurchase: () => {
    const state = get();
    if (!state.user) return;

    // Add purchases to user's purchase history
    state.cart.forEach(item => {
      userDataService.addPurchase(state.user!.id, {
        agentId: item.agent.id,
        agentName: item.agent.name,
        price: item.agent.price * item.quantity,
      });

      // If the agent has a seller, record the sale
      if (item.agent.seller && item.agent.seller.id) {
        userDataService.addSale(item.agent.seller.id, {
          agentId: item.agent.id,
          agentName: item.agent.name,
          buyer: state.user!.email,
          amount: item.agent.price * item.quantity,
        });
      }
    });

    // Clear cart after purchase
    get().clearCart();
  },
}));
