import { apiClient } from '@/lib/api-client';

export interface AdminUser {
  id: number;
  email: string;
  username: string | null;
  role: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export interface UserCreatePayload {
  email: string;
  username?: string | null;
  password?: string;
  role?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>('/admin/users');
  },

  async createUser(data: UserCreatePayload): Promise<AdminUser> {
    return apiClient.post<AdminUser>('/admin/users', data);
  },

  async updateUser(id: number, data: Partial<UserCreatePayload>): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/admin/users/${id}`, data);
  },

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete(`/admin/users/${id}`);
  }
};
