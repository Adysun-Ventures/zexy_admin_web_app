import { apiClient } from './client';
import type { Campaign, CreateCampaignRequest, CampaignsListResponse, CreateNotificationResponse } from '@/types/campaigns';

export const campaignsApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<CampaignsListResponse> => {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const response = await apiClient.get(
      `/api/v1/admin/notifications?limit=${limit}&offset=${offset}`
    );
    const data = response.data.data;
    const campaigns = (data.notifications || []).map((item: any, index: number): Campaign => {
      const notificationId = item.notification_id != null ? String(item.notification_id) : undefined;
      const sentAt: string | undefined = item.sent_date_time || item.first_sent_at;
      const targetedIds: number[] = Array.isArray(item.targeted_ids) ? item.targeted_ids : [];

      return {
        id: notificationId ?? `${sentAt ?? 'unknown'}-${index}`,
        campaign_id: notificationId,
        name: notificationId ? `Notification #${notificationId}` : 'Notification',
        title: item.title || '',
        body: item.body || '',
        status: 'completed',
        targeted_ids: targetedIds,
        sent_date_time: sentAt,
        created_by: item.created_by,
        createdAt: sentAt,
        first_sent_at: sentAt,
        recipientsCount: targetedIds.length,
        total_records: targetedIds.length,
      };
    });

    return {
      campaigns,
      total: data.total ?? campaigns.length,
      pageSize: data.limit ?? limit,
      page: Math.floor((data.offset ?? offset) / (data.limit ?? limit)) + 1,
    };
  },

  create: async (data: CreateCampaignRequest): Promise<CreateNotificationResponse> => {
    const response = await apiClient.post('/api/v1/admin/notifications', data);
    return response.data.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/api/v1/admin/notifications/${id}`);
    const item = response.data.data;
    const targetedIds: number[] = Array.isArray(item.targeted_ids) ? item.targeted_ids : [];
    const sentAt: string | undefined = item.sent_date_time || item.first_sent_at;

    return {
      id: String(id),
      campaign_id: String(id),
      name: `Notification #${id}`,
      title: item.title || '',
      body: item.body || '',
      status: 'completed',
      targeted_ids: targetedIds,
      sent_date_time: sentAt,
      created_by: item.created_by,
      createdAt: sentAt,
      first_sent_at: sentAt,
      recipientsCount: targetedIds.length,
      total_records: targetedIds.length,
    };
  },
};
