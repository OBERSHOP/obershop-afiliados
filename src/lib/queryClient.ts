import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// Configurações padrão para todas as queries
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tenta novamente para erros 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2; // Tenta no máximo 2 vezes para outros erros
    },
    onError: (error: any) => {
      // Tratamento global de erros - agora apenas exibe mensagem genérica
      toast.error("Ops... Ocorreu um problema em nosso servidor, tente novamente.");
    },
  },
  mutations: {
    onError: (error: any) => {
      // Tratamento global de erros em mutações - agora apenas exibe mensagem genérica
      toast.error("Ops... Ocorreu um problema em nosso servidor, tente novamente.");
    },
  },
};

// Factory function para criar um QueryClient com configurações consistentes
export const createQueryClient = () => 
  new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
