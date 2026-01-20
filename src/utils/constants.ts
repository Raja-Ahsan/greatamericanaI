// Application constants

export const APP_NAME = 'GreatAmerican.Ai';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MARKETPLACE: '/marketplace',
  AGENT_DETAIL: '/agent/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  SELL: '/sell',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  USERS: 'greatamerican_users',
  CURRENT_USER: 'greatamerican_current_user',
  CART: 'cart_',
  PURCHASES: 'purchases_',
  LISTINGS: 'listings_',
  SALES: 'sales_',
  WISHLIST: 'wishlist_',
} as const;

export const CATEGORIES = [
  'All',
  'Customer Service',
  'Content Creation',
  'Data Analysis',
  'Automation',
  'Research',
  'Sales',
  'Marketing',
  'Development',
] as const;

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
] as const;

export const PLATFORM_FEE = 0.15; // 15% platform fee
export const SELLER_COMMISSION = 0.85; // 85% goes to seller

export const TAX_RATE = 0.10; // 10% tax

export const DEMO_CREDENTIALS = {
  email: 'demo@greatamerican.ai',
  password: 'demo123',
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 150,
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
} as const;
