export interface Agent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  seller: {
    id: string;
    name: string;
    verified: boolean;
  };
  capabilities: string[];
  apiAccess: boolean;
  model: string;
  responseTime: string;
  languages: string[];
  tags: string[];
  dateAdded: string;
  sales: number;
}

export interface CartItem {
  agent: Agent;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  role?: 'admin' | 'vendor' | 'customer';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export type Category = 
  | 'All'
  | 'Customer Service'
  | 'Content Creation'
  | 'Data Analysis'
  | 'Automation'
  | 'Research'
  | 'Sales'
  | 'Marketing'
  | 'Development';
