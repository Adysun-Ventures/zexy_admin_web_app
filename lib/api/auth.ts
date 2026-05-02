import { apiClient } from './client';

export interface OTPSendRequest {
  mobile: string;
}

export interface OTPSendResponse {
  success: boolean;
  data: {
    status: string;
    message: string;
  };
}

export interface OTPVerifyRequest {
  mobile: string;
  otp: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export const authApi = {
  sendOTP: async (data: OTPSendRequest): Promise<OTPSendResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/otp/send', data);
    // API wraps response in { success, data, error, meta }
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/otp/verify', data);
    // API wraps response in { success, data, error, meta }
    return response.data;
  },
};
