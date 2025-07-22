import Constants from 'expo-constants';

// Get the API base URL from environment or use default
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  Constants.expoConfig?.extra?.apiUrl || 
  'http://localhost:3001';

export const API_ENDPOINTS = {
  wardrobe: '/api/wardrobe',
  ai: '/api/ai',
  auth: '/api/auth',
  upload: '/api/upload',
} as const;

export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG,
};