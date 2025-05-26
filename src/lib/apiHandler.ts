// lib/apiHandler.ts

import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

function customParamsSerializer(
  params: Record<string, string | number | boolean | string[] | undefined | null>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((val) => searchParams.append(key, String(val)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString().replace(/%2B/g, "+");
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  paramsSerializer: customParamsSerializer,
});

apiClient.interceptors.request.use(
  (config) => {
    useUiStore.getState().startApiRequest(config.url ?? "unknown");
    return config;
  },
  (error) => {
    useUiStore.getState().finishApiRequest(error?.config?.url ?? "unknown");
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    useUiStore.getState().finishApiRequest(response.config.url ?? "unknown");
    return response;
  },
  (error) => {
    useUiStore.getState().finishApiRequest(error?.config?.url ?? "unknown");

    // Verificar se é um erro específico de validação de sessão
    const isSessionValidationError = error?.config?.url?.includes('/auth/validate-session-id') && 
                                    error?.response?.status === 401;
    
    if (isSessionValidationError) {
      // Apenas desloga se for um erro na validação de sessão
      console.log('Interceptor: Erro na validação de sessão, deslogando usuário');
      const auth = useAuthStore.getState();
      auth.clearSession();
      toast.error("Sessão expirada. Faça login novamente.");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else {
      // Para qualquer outro erro, apenas exibe um toast genérico
      console.log('Interceptor: Erro na requisição, exibindo mensagem genérica');
      toast.error("Ops... Ocorreu um problema em nosso servidor, tente novamente.");
    }

    return Promise.reject(error);
  }
);
