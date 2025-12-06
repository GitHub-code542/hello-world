import api from '@/lib/api';
import { Goal, ApiResponse } from '@/types';

export const goalService = {
  // Get all goals
  async getAll(): Promise<ApiResponse<Goal[]>> {
    const response = await api.get<ApiResponse<Goal[]>>('/goals');
    return response.data;
  },

  // Create new goal
  async create(data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Goal>> {
    const response = await api.post<ApiResponse<Goal>>('/goals', data);
    return response.data;
  },

  // Update goal
  async update(id: string, data: Partial<Goal>): Promise<ApiResponse<Goal>> {
    const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, data);
    return response.data;
  },

  // Delete goal
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/goals/${id}`);
    return response.data;
  },
};
