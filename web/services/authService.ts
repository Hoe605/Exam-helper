import { apiClient } from '@/lib/api-client';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(credentials: URLSearchParams): Promise<LoginResponse> {
    return apiClient.postForm<LoginResponse>('/auth/jwt/login', credentials);
  },

  async getCurrentUser(token?: string): Promise<any> {
    const options = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
    return apiClient.get('/users/me', options);
  },

  async logout(): Promise<void> {
    try {
       await apiClient.post('/auth/jwt/logout', {});
    } catch (e) {
       // Silently fail if logout endpoint is not available or already expired
       console.warn("Logout request failed:", e);
    }
  }
};
