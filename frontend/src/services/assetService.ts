import api from '@/lib/api';
import { Asset, ApiResponse } from '@/types';

export const assetService = {
  // Get all assets
  async getAll(): Promise<ApiResponse<Asset[]>> {
    const response = await api.get<ApiResponse<Asset[]>>('/assets');
    return response.data;
  },

  // Create new asset
  async create(data: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Asset>> {
    const response = await api.post<ApiResponse<Asset>>('/assets', data);
    return response.data;
  },

  // Update asset
  async update(id: string, data: Partial<Asset>): Promise<ApiResponse<Asset>> {
    const response = await api.put<ApiResponse<Asset>>(`/assets/${id}`, data);
    return response.data;
  },

  // Delete asset
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/assets/${id}`);
    return response.data;
  },
};
