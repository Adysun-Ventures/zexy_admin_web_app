import { apiClient } from './client';
import type { OTPSendRequest, OTPSendResponse, OTPVerifyRequest, OTPVerifyResponse } from '@/types/auth';

export const authApi = {
  sendOTP: async (data: OTPSendRequest): Promise<OTPSendResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/otp/send', data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<OTPVerifyResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/otp/verify', data);
    return response.data;
  },
};
