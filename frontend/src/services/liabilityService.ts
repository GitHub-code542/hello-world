import api from '@/lib/api';
import { Liability, ApiResponse } from '@/types';

export const liabilityService = {
  // Get all liabilities
  async getAll(): Promise<ApiResponse<Liability[]>> {
    const response = await api.get<ApiResponse<Liability[]>>('/liabilities');
    return response.data;
  },

  // Create new liability
  async create(data: Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Liability>> {
    const response = await api.post<ApiResponse<Liability>>('/liabilities', data);
    return response.data;
  },

  // Update liability
  async update(id: string, data: Partial<Liability>): Promise<ApiResponse<Liability>> {
    const response = await api.put<ApiResponse<Liability>>(`/liabilities/${id}`, data);
    return response.data;
  },

  // Delete liability
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/liabilities/${id}`);
    return response.data;
  },
};
