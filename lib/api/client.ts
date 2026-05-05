import axios from 'axios';
import { config } from '@/lib/config';

// Authentication error codes that should trigger logout
const AUTH_ERROR_CODES = ['AUTH_002', 'AUTH_003', 'AUTH_008'];

// Create axios instance with runtime-configurable base URL
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const errorCode = error.response?.data?.error?.code;
    const status = error.response?.status;

    // Check for authentication errors that require logout
    const shouldLogout = 
      status === 401 || 
      status === 403 ||
      (errorCode && AUTH_ERROR_CODES.includes(errorCode));

    if (shouldLogout) {
      // Dispatch custom event for session expiry
      const event = new CustomEvent('session-expired', {
        detail: {
          code: errorCode,
          message: error.response?.data?.error?.message || 'Your session has expired',
        },
      });
      window.dispatchEvent(event);

      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Redirect to login after a brief delay to show the modal
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    return Promise.reject(error);
  }
);
