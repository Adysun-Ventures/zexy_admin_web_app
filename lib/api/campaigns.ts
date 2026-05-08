import { apiClient } from './client';
import type { Campaign, CreateCampaignRequest, CampaignsListResponse } from '@/types/campaigns';

export const campaignsApi = {
  list: async (): Promise<CampaignsListResponse> => {
    const response = await apiClient.get('/api/v1/admin/notifications');
    // API wraps response in { success, data, error, meta }
    return response.data.data;
  },

  create: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post('/api/v1/admin/notifications', data);
    return response.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/api/v1/admin/notifications/${id}`);
    return response.data.data;
  },
};
