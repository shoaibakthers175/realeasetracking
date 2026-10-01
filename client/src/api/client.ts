import axios, { AxiosError } from 'axios';

const getBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If VITE_API_URL is the internal Render service name, map it to public URL
  if (url === 'releasetrack-server' || url === 'http://releasetrack-server' || url === 'https://releasetrack-server') {
    return 'https://releasetrack-server.onrender.com/api';
  }

  if (!url) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      return 'https://releasetrack-server.onrender.com/api';
    }
    return '/api';
  }

  if (url === '/api') return '/api';

  // If url has no dot and is not localhost/relative, append .onrender.com
  if (!url.includes('.') && !url.startsWith('/') && !url.includes('localhost')) {
    url = `https://${url}.onrender.com`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  if (!url.endsWith('/api')) {
    url = `${url.replace(/\/+$/, '')}/api`;
  }

  return url;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('releasetrack_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error?: { message: string; code: string } }>) => {
    if (error.response?.status === 401) {
      // If token is invalid/expired and not already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('releasetrack_token');
        localStorage.removeItem('releasetrack_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.error?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
