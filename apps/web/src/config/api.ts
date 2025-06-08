export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  PHOTOS: {
    BASE: `${API_URL}/api/photos`,
    UPLOAD: `${API_URL}/api/photos/upload`,
    TAGS: `${API_URL}/api/photos/tags`,
  },
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    ME: `${API_URL}/api/auth/me`,
  },
} as const; 