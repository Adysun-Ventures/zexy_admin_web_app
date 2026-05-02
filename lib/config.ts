/**
 * Runtime configuration for the admin web app.
 * This ensures environment variables work correctly in both build-time and runtime scenarios.
 */

export const config = {
  /**
   * API Base URL - can be overridden at runtime for local development
   * Priority: Runtime env var > Build-time env var > Default
   */
  apiBaseUrl: 
    (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_API_BASE_URL__) ||
    process.env.NEXT_PUBLIC_API_BASE_URL || 
    'https://api.zexy.live',
} as const;

// Log the active API URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Base URL:', config.apiBaseUrl);
}
