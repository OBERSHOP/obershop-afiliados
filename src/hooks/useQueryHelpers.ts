import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';

// Hook genérico para fazer requisições GET com tratamento de loading
export function useApiQuery<TData = unknown, TError = unknown>(
  endpoint: string,
  queryKey: unknown[],
  options?: UseQueryOptions<TData, TError, TData>,
  params?: Record<string, string | number | boolean>,
) {
  const sessionId = useAuthStore((state) => state.sessionId);
  const { startApiRequest, finishApiRequest } = useUiStore();
  const requestId = `query_${endpoint}_${uuidv4()}`;

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      startApiRequest(requestId);
      try {
        const response = await api.get(endpoint, {
          params,
          headers: sessionId ? { 'Session-Id': sessionId } : undefined,
        });
        return response.data;
      } finally {
        finishApiRequest(requestId);
      }
    },
    enabled: !!sessionId,
    ...options,
  });
}

// Hook genérico para fazer mutações (POST, PUT, DELETE)
export function useApiMutation<
  TData = unknown,
  TVariables extends object = object,
  TError = unknown,
>(
  endpoint: string,
  method: 'post' | 'put' | 'delete' | 'patch',
  options?: UseMutationOptions<TData, TError, TVariables>,
  invalidateQueries?: string[],
) {
  const sessionId = useAuthStore((state) => state.sessionId);
  const queryClient = useQueryClient();
  const { startApiRequest, finishApiRequest } = useUiStore();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const requestId = `mutation_${endpoint}_${uuidv4()}`;
      startApiRequest(requestId);
      try {
        const response = await api[method](endpoint, variables, {
          headers: sessionId ? { 'Session-Id': sessionId } : undefined,
        });
        return response.data;
      } finally {
        finishApiRequest(requestId);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidar queries relacionadas automaticamente
      if (invalidateQueries?.length) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Chamar o onSuccess personalizado se existir
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

// Hook para prefetch de dados
export function usePrefetchQuery(
  queryKey: string,
  endpoint: string,
  params?: Record<string, string | number | boolean>,
) {
  const queryClient = useQueryClient();
  const sessionId = useAuthStore((state) => state.sessionId);

  const prefetch = async () => {
    if (!sessionId) return;

    await queryClient.prefetchQuery({
      queryKey: [queryKey],
      queryFn: async () => {
        const response = await api.get(endpoint, {
          params,
          headers: { 'Session-Id': sessionId },
        });
        return response.data;
      },
    });
  };

  return { prefetch };
}
