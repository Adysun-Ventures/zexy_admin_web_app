export interface Campaign {
  id: string;
  name: string;
  title: string;
  body: string;
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  targetAudience?: string[];
  recipientsCount?: number;
  createdAt?: string;
  scheduledAt?: string;
  sentAt?: string;
}

export interface CreateCampaignRequest {
  name: string;
  title: string;
  body: string;
  targetAudience?: string[];
  scheduledAt?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  page?: number;
  pageSize?: number;
}
