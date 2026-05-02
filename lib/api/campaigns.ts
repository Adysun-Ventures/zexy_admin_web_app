import { apiClient } from './client';
import type { Campaign, CreateCampaignRequest, CampaignsListResponse } from '@/types/campaigns';

export const campaignsApi = {
  list: async (): Promise<CampaignsListResponse> => {
    const response = await apiClient.get('/api/v1/admin/notifications/campaigns');
    return response.data;
  },

  create: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post('/api/v1/admin/notifications/campaign', data);
    return response.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/api/v1/admin/notifications/campaigns/${id}`);
    return response.data;
  },
};
