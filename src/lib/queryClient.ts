import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

// Configurações padrão para todas as queries
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
  },
  mutations: {
    onError: (error: unknown) => {
      console.log(error);
      // Tratamento global de erros em mutações - agora apenas exibe mensagem genérica
      toast.error(
        'Ops... Ocorreu um problema em nosso servidor, tente novamente.',
      );
    },
  },
};

// Factory function para criar um QueryClient com configurações consistentes
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
