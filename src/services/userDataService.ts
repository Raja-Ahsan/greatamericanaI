import { Agent, CartItem } from '../types';

// Service to manage user-specific data (cart, purchases, listings, etc.)

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

class UserDataService {
  // Cart Management
  getCart(userId: string): CartItem[] {
    const key = `cart_${userId}`;
    const cart = localStorage.getItem(key);
    return cart ? JSON.parse(cart) : [];
  }

  saveCart(userId: string, cart: CartItem[]): void {
    const key = `cart_${userId}`;
    localStorage.setItem(key, JSON.stringify(cart));
  }

  clearCart(userId: string): void {
    const key = `cart_${userId}`;
    localStorage.removeItem(key);
  }

  // Purchase History
  getPurchases(userId: string): Purchase[] {
    const key = `purchases_${userId}`;
    const purchases = localStorage.getItem(key);
    return purchases ? JSON.parse(purchases) : [];
  }

  addPurchase(userId: string, purchase: Omit<Purchase, 'id' | 'userId' | 'purchaseDate'>): void {
    const purchases = this.getPurchases(userId);
    const newPurchase: Purchase = {
      ...purchase,
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      purchaseDate: new Date().toISOString(),
    };
    purchases.push(newPurchase);
    
    const key = `purchases_${userId}`;
    localStorage.setItem(key, JSON.stringify(purchases));
  }

  // User's Agent Listings
  getListings(userId: string): AgentListing[] {
    const key = `listings_${userId}`;
    const listings = localStorage.getItem(key);
    return listings ? JSON.parse(listings) : [];
  }

  addListing(userId: string, agent: Omit<AgentListing, 'id' | 'userId' | 'status' | 'listedDate'>): AgentListing {
    const listings = this.getListings(userId);
    const newListing: AgentListing = {
      ...agent,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      status: 'pending',
      listedDate: new Date().toISOString(),
      sales: 0,
      rating: 0,
      reviews: 0,
    };
    listings.push(newListing);
    
    const key = `listings_${userId}`;
    localStorage.setItem(key, JSON.stringify(listings));
    
    return newListing;
  }

  updateListing(userId: string, agentId: string, updates: Partial<AgentListing>): void {
    const listings = this.getListings(userId);
    const index = listings.findIndex(l => l.id === agentId);
    
    if (index !== -1) {
      listings[index] = { ...listings[index], ...updates };
      const key = `listings_${userId}`;
      localStorage.setItem(key, JSON.stringify(listings));
    }
  }

  deleteListing(userId: string, agentId: string): void {
    const listings = this.getListings(userId);
    const filtered = listings.filter(l => l.id !== agentId);
    
    const key = `listings_${userId}`;
    localStorage.setItem(key, JSON.stringify(filtered));
  }

  // User Stats
  getStats(userId: string): UserStats {
    const listings = this.getListings(userId);
    const purchases = this.getPurchases(userId);
    
    const activeListings = listings.filter(l => l.status === 'active').length;
    const totalSales = listings.reduce((sum, l) => sum + l.sales, 0);
    const totalRevenue = listings.reduce((sum, l) => sum + (l.price * l.sales * 0.85), 0); // 85% after platform fee
    const totalViews = listings.reduce((sum, l) => sum + (l.sales * 10), 0); // Mock view calculation
    
    return {
      totalSales,
      totalRevenue,
      activeListings,
      totalViews,
    };
  }

  // Sales data for a user's listings
  getSales(userId: string): Array<{ agentId: string; agentName: string; buyer: string; amount: number; date: string }> {
    const key = `sales_${userId}`;
    const sales = localStorage.getItem(key);
    return sales ? JSON.parse(sales) : [];
  }

  addSale(userId: string, sale: { agentId: string; agentName: string; buyer: string; amount: number }): void {
    const sales = this.getSales(userId);
    sales.push({
      ...sale,
      date: new Date().toISOString(),
    });
    
    const key = `sales_${userId}`;
    localStorage.setItem(key, JSON.stringify(sales));
    
    // Update listing sales count
    const listings = this.getListings(userId);
    const listing = listings.find(l => l.id === sale.agentId);
    if (listing) {
      listing.sales += 1;
      const listingsKey = `listings_${userId}`;
      localStorage.setItem(listingsKey, JSON.stringify(listings));
    }
  }

  // Wishlist
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
