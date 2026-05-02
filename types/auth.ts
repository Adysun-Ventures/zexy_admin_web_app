export interface OTPSendRequest {
  email?: string;
  mobile?: string;
}

export interface OTPSendResponse {
  success: boolean;
  message: string;
}

export interface OTPVerifyRequest {
  email?: string;
  mobile?: string;
  otp: string;
}

export interface OTPVerifyResponse {
  success: boolean;
i  data: {
    access_token: string;
    refresh_token: string;
    session_token: string;
    token_type: string;
    is_new_user: boolean;
    onboarding_step: number;
  };
  error: null | string;
  meta: {
    request_id: string;
  };
}

export interface User {
  id: string;
  email?: string;
  mobile?: string;
  name?: string;
  role: string;
}
