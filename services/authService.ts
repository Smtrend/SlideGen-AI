
import { User, UserType, SubscriptionStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'slidegen_users';
const CURRENT_USER_KEY = 'slidegen_current_user';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async register(email: string, password: string, name: string, userType: UserType): Promise<User> {
    await delay(800);

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email.');
    }

    const newUser: any = {
      id: uuidv4(),
      email,
      name,
      password,
      userType,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialStartDate: Date.now(),
      paymentMethodLinked: false,
      studentVerified: false
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...userToReturn } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
    
    return userToReturn;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(800);

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const { password: _, ...userToReturn } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));

    return userToReturn;
  },

  async updateUser(updatedUser: User): Promise<void> {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex((u: any) => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
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
