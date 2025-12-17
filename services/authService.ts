import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'slidegen_users';
const CURRENT_USER_KEY = 'slidegen_current_user';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    await delay(800); // Simulate network

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if user exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email.');
    }

    const newUser = {
      id: uuidv4(),
      email,
      name,
      password, // In a real app, never store plain text passwords!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after register
    const userToReturn = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
    
    return userToReturn;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(800); // Simulate network

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const userToReturn = { id: user.id, email: user.email, name: user.name };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));

    return userToReturn;
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};