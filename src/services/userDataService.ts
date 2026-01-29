import { Agent, CartItem } from '../types';
import api from '../utils/api';

// Service to manage user-specific data via Laravel API

export interface Purchase {
  id: string;
  agentId: string;
  agentName: string;
  price: number;
  purchaseDate: string;
  userId: string;
}

export interface AgentListing extends Agent {
  userId: string;
  status: 'active' | 'pending' | 'inactive';
  listedDate: string;
}

export interface UserStats {
  totalSales: number;
  totalRevenue: number;
  activeListings: number;
  totalViews: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class UserDataService {
  // Cart Management - API calls
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get<ApiResponse<CartItem[]>>('/cart');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  async addToCart(agentId: string, quantity: number = 1): Promise<boolean> {
    try {
      await api.post('/cart', { agent_id: agentId, quantity });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  }

  async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      await api.delete(`/cart/${cartItemId}`);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      await api.delete('/cart');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // Purchase History - API calls
  async getPurchases(): Promise<Purchase[]> {
    try {
      const response = await api.get<ApiResponse<Purchase[]>>('/purchases');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  }

  async completePurchase(): Promise<boolean> {
    try {
      await api.post('/purchases');
      return true;
    } catch (error) {
      console.error('Error completing purchase:', error);
      return false;
    }
  }

  // Agent Listings - API calls
  async getListings(): Promise<AgentListing[]> {
    try {
      const response = await api.get<ApiResponse<AgentListing[]>>('/my-listings');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  async addListing(agentData: any): Promise<AgentListing | null> {
    try {
      const response = await api.post<ApiResponse<AgentListing>>('/agents', agentData);
      return response.data || null;
    } catch (error) {
      console.error('Error adding listing:', error);
      return null;
    }
  }

  async updateListing(agentId: string, updates: Partial<AgentListing>): Promise<boolean> {
    try {
      await api.put(`/agents/${agentId}`, updates);
      return true;
    } catch (error) {
      console.error('Error updating listing:', error);
      return false;
    }
  }

  async deleteListing(agentId: string): Promise<boolean> {
    try {
      await api.delete(`/agents/${agentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  // Dashboard Stats - API calls
  async getDashboardStats(): Promise<{ stats: UserStats; recentSales: any[] } | null> {
    try {
      const response = await api.get<ApiResponse<{ stats: UserStats; recentSales: any[] }>>('/dashboard');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  }

  // Legacy methods for backward compatibility (now use API) – different names to avoid duplicate implementation
  getCartLegacy(_userId: string): CartItem[] {
    console.warn('getCartLegacy is deprecated, use async getCart() instead');
    return [];
  }

  saveCartLegacy(_userId: string, _cart: CartItem[]): void {
    console.warn('saveCartLegacy is deprecated, cart is managed via API');
  }

  clearCartLegacy(_userId: string): void {
    console.warn('clearCartLegacy is deprecated, use async clearCart() instead');
  }

  getPurchasesLegacy(_userId: string): Purchase[] {
    console.warn('getPurchasesLegacy is deprecated, use async getPurchases() instead');
    return [];
  }

  addPurchaseLegacy(_userId: string, _purchase: Omit<Purchase, 'id' | 'userId' | 'purchaseDate'>): void {
    console.warn('addPurchaseLegacy is deprecated, purchases are managed via API');
  }

  getListingsLegacy(_userId: string): AgentListing[] {
    console.warn('getListingsLegacy is deprecated, use async getListings() instead');
    return [];
  }

  addListingLegacy(_userId: string, agent: Omit<AgentListing, 'id' | 'userId' | 'status' | 'listedDate'>): AgentListing {
    console.warn('addListingLegacy is deprecated, use async addListing(agentData) instead');
    return agent as AgentListing;
  }

  updateListingLegacy(_userId: string, _agentId: string, _updates: Partial<AgentListing>): void {
    console.warn('updateListingLegacy is deprecated, use async updateListing(agentId, updates) instead');
  }

  deleteListingLegacy(_userId: string, _agentId: string): void {
    console.warn('deleteListingLegacy is deprecated, use async deleteListing(agentId) instead');
  }

  getStatsLegacy(_userId: string): UserStats {
    console.warn('getStatsLegacy is deprecated, use async getDashboardStats() instead');
    return {
      totalSales: 0,
      totalRevenue: 0,
      activeListings: 0,
      totalViews: 0,
    };
  }

  getSalesLegacy(_userId: string): Array<{ agentId: string; agentName: string; buyer: string; amount: number; date: string }> {
    console.warn('getSalesLegacy is deprecated, use getDashboardStats() instead');
    return [];
  }

  addSaleLegacy(_userId: string, _sale: { agentId: string; agentName: string; buyer: string; amount: number }): void {
    console.warn('addSaleLegacy is deprecated, sales are managed via API');
  }

  getWishlist(userId: string): string[] {
    const key = `wishlist_${userId}`;
    const wishlist = localStorage.getItem(key);
    return wishlist ? JSON.parse(wishlist) : [];
  }

  addToWishlist(userId: string, agentId: string): void {
    const wishlist = this.getWishlist(userId);
    if (!wishlist.includes(agentId)) {
      wishlist.push(agentId);
      const key = `wishlist_${userId}`;
      localStorage.setItem(key, JSON.stringify(wishlist));
    }
  }

  removeFromWishlist(userId: string, agentId: string): void {
    const wishlist = this.getWishlist(userId);
    const filtered = wishlist.filter(id => id !== agentId);
    const key = `wishlist_${userId}`;
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

export const userDataService = new UserDataService();
