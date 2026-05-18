export interface Campaign {
  id: string;
  name: string;
  title: string;
  body: string;
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  targeted_ids?: number[];
  sent_date_time?: string;
  created_by?: string;
  campaign_id?: string;
  first_sent_at?: string;
  total_sent?: number;
  total_failed?: number;
  total_skipped?: number;
  last_sent_at?: string;
  total_records?: number;
  sample_failures?: string[];
  targetAudience?: string[];
  recipientsCount?: number;
  createdAt?: string;
  scheduledAt?: string;
  sentAt?: string;
}

export interface CreateCampaignRequest {
  title: string;
  body: string;
  targeted_ids?: number[];
}

export interface CreateNotificationResponse {
  notification_id: number;
  users_targeted: number;
  notifications_queued: number;
}

export interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  page?: number;
  pageSize?: number;
}
