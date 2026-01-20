import { User } from '../types';

const USERS_STORAGE_KEY = 'greatamerican_users';
const CURRENT_USER_KEY = 'greatamerican_current_user';

export interface AuthUser extends User {
  password: string;
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Get all users from localStorage
  private getUsers(): AuthUser[] {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  private saveUsers(users: AuthUser[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Register a new user
  register(data: RegisterData): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();

    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: AuthUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email,
      password: data.password, // In production, this should be hashed
      verified: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  }

  // Login user
  login(data: LoginData): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === data.email && u.password === data.password);

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Save current user session
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // Get current logged in user
  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Update user profile
  updateProfile(userId: string, updates: Partial<User>): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);

    // Update current user session
    const { password, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
