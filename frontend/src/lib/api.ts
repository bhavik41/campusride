import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusride_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusride_token');
      localStorage.removeItem('campusride_user');
      // Don't redirect here - let the component handle it
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string })?.error || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
