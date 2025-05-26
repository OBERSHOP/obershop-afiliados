import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const sessionId = useAuthStore.getState().sessionId;
  if (sessionId) {
    config.headers['Session-Id'] = sessionId;
  }
  return config;
});
