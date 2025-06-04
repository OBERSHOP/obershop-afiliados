import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Ajuda a identificar requisições AJAX
  }
});

// Interceptor para adicionar headers e logs
api.interceptors.request.use((config) => {
  const sessionId = useAuthStore.getState().sessionId;
  if (sessionId) {
    config.headers['Session-Id'] = sessionId;
  }
  
  // Log da requisição para depuração
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    headers: config.headers,
    data: config.data,
  });
  
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Interceptor para logs de resposta e tratamento de erros
api.interceptors.response.use((response) => {
  console.log(`[API Response] ${response.status} ${response.config.url}`, {
    data: response.data,
    headers: response.headers,
  });
  return response;
}, (error) => {
  if (error.response) {
    console.error(`[API Error] ${error.response.status} ${error.config?.url}`, {
      data: error.response.data,
      headers: error.response.headers,
    });
    
    // Log específico para erros de CORS
    if (error.response.status === 0 || 
        (error.message && error.message.includes('Network Error'))) {
      console.error('[CORS Error] Possível erro de CORS', {
        url: error.config?.url,
        origin: window.location.origin,
      });
    }
  } else {
    console.error('[API Error] Sem resposta', error.message);
  }
  
  return Promise.reject(error);
});
