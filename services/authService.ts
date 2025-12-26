
import { User, UserType, SubscriptionStatus } from '../types';
import { supabase } from './supabaseClient';

export const authService = {
  async register(email: string, password: string, name: string, userType: UserType): Promise<User> {
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_type: userType
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed. Please try again.');

    const profile: User = {
      id: authData.user.id,
      email: email,
      name: name,
      userType: userType,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialStartDate: Date.now(),
      paymentMethodLinked: false,
      studentVerified: false
    };

    // 2. Use UPSERT instead of INSERT to handle cases where the user 
    // attempts to register again after a failed/unconfirmed first attempt.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (profileError) {
      throw profileError;
    }

    return profile;
  },

  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    const profile = await this.getProfile(authData.user.id);
    if (!profile) throw new Error('Profile not found');

    return profile;
  },

  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      userType: data.userType as UserType,
      subscriptionStatus: data.subscriptionStatus as SubscriptionStatus,
      trialStartDate: typeof data.trialStartDate === 'string' ? parseInt(data.trialStartDate) : data.trialStartDate,
      paymentMethodLinked: data.paymentMethodLinked,
      studentVerified: data.studentVerified,
      schoolName: data.schoolName
    };
  },

  async updateUser(updatedUser: User): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updatedUser)
      .eq('id', updatedUser.id);

    if (error) throw error;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  getCurrentUser(): User | null {
    return null; // Managed by session listener in App.tsx
  }
};
