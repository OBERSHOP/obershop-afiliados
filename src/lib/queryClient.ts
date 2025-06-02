import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

// Configurações padrão para todas as queries
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false, // Desabilita retentativas por padrão
    retryOnMount: false, // Não tenta novamente ao montar o componente
    refetchInterval: false, // Desabilita refetch automático
    onError: (error) => {
      console.error('Query error:', error);
      // Não exibimos toast para erros de query por padrão
    },
  },
  mutations: {
    onError: (error: unknown) => {
      console.error('Mutation error:', error);
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

