import { apiClient } from './client';

export interface User {
  id: number;
  mobile: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  role: 'creator' | 'fan' | 'admin';
  is_active: boolean;
  is_deleted: boolean;
  has_completed_onboarding: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

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
    // API wraps response in { success, data, error, meta }
    return response.data.data;
  },

  getCreatorStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/api/v1/admin/creators/stats');
    return response.data.data;
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
    return response.data.data;
  },

  getFanStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/api/v1/admin/fans/stats');
    return response.data.data;
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
