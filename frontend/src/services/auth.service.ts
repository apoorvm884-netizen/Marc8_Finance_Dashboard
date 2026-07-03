import { api } from './api-client';
import type { LoginCredentials, UpdateProfileData, User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
  isFirstLogin?: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', credentials, { skipAuth: true });
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // best effort
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/auth/profile');
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return api.put<User>('/auth/profile', data);
  },
};
