import api from '@/lib/api';
import { FinancialData, ApiResponse } from '@/types';

export const financialService = {
  // Get all financial data for current user
  async getAll(): Promise<ApiResponse<FinancialData[]>> {
    const response = await api.get<ApiResponse<FinancialData[]>>('/financial');
    return response.data;
  },

  // Save financial data (batch create/update)
  async save(data: Omit<FinancialData, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<FinancialData[]>> {
    const response = await api.post<ApiResponse<FinancialData[]>>('/financial', data);
    return response.data;
  },

  // Update single financial data entry
  async update(id: string, data: Partial<FinancialData>): Promise<ApiResponse<FinancialData>> {
    const response = await api.put<ApiResponse<FinancialData>>(`/financial/${id}`, data);
    return response.data;
  },

  // Delete financial data entry
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/financial/${id}`);
    return response.data;
  },
};
