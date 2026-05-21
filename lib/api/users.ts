import { apiClient } from './client';

export interface User {
  id: number;
  mobile: string;
  username: string | null;
  name: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  avatar: string | null;
  role: 'creator' | 'fan' | 'admin';
  is_active: boolean;
  is_deleted: boolean;
  has_completed_onboarding: boolean;
  last_login_at: string | null;
  last_login_on?: string | null;
  created_at: string | null;
  created_on?: string | null;
}

export interface UserDetail extends User {
  category: string | null;
  onboarding_step: number;
  onboarding_completed_at: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  age_verified_at: string | null;
  consent_version: string | null;
  gender: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  preferred_language: string;
  created_by_name?: string | null;
  updated_by_name?: string | null;
}

const normalizeUser = (user: any): User => ({
  ...user,
  last_login_at: user.last_login_at ?? user.last_login_on ?? null,
});

const normalizeUserDetail = (user: any): UserDetail => ({
  ...user,
  last_login_at: user.last_login_at ?? user.last_login_on ?? null,
});

export interface UserListResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  deleted_users: number;
  completed_onboarding: number;
  pending_onboarding: number;
}

export interface FanPayload {
  mobile: string;
  username: string;
  name: string;
  gender: string;
  date_of_birth: string;
  city: string;
  state: string;
  country: string;
}

export interface FanCreatePayload {
  mobile: string;
  username: string;
  name: string;
  role: 'creator' | 'fan' | 'admin';
  is_active: boolean;
  has_completed_onboarding: boolean;
  category: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  avatar: string;
  date_of_birth: string;
}

export interface CreatorPayload {
  mobile: string;
  username: string;
  name: string;
  gender: string;
  date_of_birth: string;
  city: string;
  state: string;
  country: string;
}

export interface CreatorCreatePayload {
  mobile: string;
  username: string;
  name: string;
  role: 'creator' | 'fan' | 'admin';
  is_active: boolean;
  has_completed_onboarding: boolean;
  category: string;
  gender: string;
  date_of_birth: string;
  city: string;
  state: string;
  country: string;
  avatar: string;
}

export interface CreatorUpdatePayload {
  name: string;
  username: string;
  avatar: string;
  category: string;
  is_active: boolean;
  role: 'creator' | 'fan' | 'admin';
  gender: string;
  date_of_birth: string;
  city: string;
  state: string;
  country: string;
}

export const usersApi = {
  // Creators
  listCreators: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    is_active?: boolean;
    include_deleted?: boolean;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/api/v1/admin/creators', { params });
    const data = response.data.data;
    return {
      ...data,
      users: (data.users || []).map(normalizeUser),
    };
  },

  getCreatorStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/api/v1/admin/creators/stats');
    return response.data.data;
  },

  getCreatorDetail: async (id: number): Promise<UserDetail> => {
    const response = await apiClient.get(`/api/v1/admin/creators/${id}`);
    return normalizeUserDetail(response.data.data);
  },

  createCreator: async (payload: CreatorCreatePayload): Promise<UserDetail> => {
    const response = await apiClient.post('/api/v1/admin/creators', payload);
    return normalizeUserDetail(response.data.data);
  },

  updateCreator: async (id: number, payload: CreatorUpdatePayload): Promise<UserDetail> => {
    const response = await apiClient.put(`/api/v1/admin/creators/${id}`, payload);
    return normalizeUserDetail(response.data.data);
  },

  deleteCreator: async (id: number, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/creators/${id}`, {
      params: { hard_delete: hardDelete },
    });
  },

  restoreCreator: async (id: number): Promise<User> => {
    const response = await apiClient.post(`/api/v1/admin/creators/${id}/restore`);
    return response.data.data;
  },

  // Fans
  listFans: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    is_active?: boolean;
    include_deleted?: boolean;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/api/v1/admin/fans', { params });
    const data = response.data.data;
    return {
      ...data,
      users: (data.users || []).map(normalizeUser),
    };
  },

  getFanStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/api/v1/admin/fans/stats');
    return response.data.data;
  },

  getFanDetail: async (id: number): Promise<UserDetail> => {
    const response = await apiClient.get(`/api/v1/admin/fans/${id}`);
    return normalizeUserDetail(response.data.data);
  },

  createFan: async (payload: FanCreatePayload): Promise<UserDetail> => {
    const response = await apiClient.post('/api/v1/admin/fans', payload);
    return normalizeUserDetail(response.data.data);
  },

  updateFan: async (id: number, payload: FanPayload): Promise<UserDetail> => {
    const response = await apiClient.put(`/api/v1/admin/fans/${id}`, payload);
    return normalizeUserDetail(response.data.data);
  },

  deleteFan: async (id: number, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/fans/${id}`, {
      params: { hard_delete: hardDelete },
    });
  },

  restoreFan: async (id: number): Promise<User> => {
    const response = await apiClient.post(`/api/v1/admin/fans/${id}/restore`);
    return response.data.data;
  },
};
