import api from '@/lib/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse, User } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export const authService = {
  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    const { refreshToken } = useAuthStore.getState();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },
};
