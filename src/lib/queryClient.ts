import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

// Factory function para criar um QueryClient com configurações consistentes
export const createQueryClient = () => {
  // Criar cache para queries com handler de erro global
  const queryCache = new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
      // Não exibimos toast para erros de query por padrão
    },
  });

  // Criar cache para mutations com handler de erro global
  const mutationCache = new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error(
        'Ops... Ocorreu um problema em nosso servidor, tente novamente.',
      );
    },
  });

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false, // Desabilita retentativas por padrão
        retryOnMount: false, // Não tenta novamente ao montar o componente
        refetchInterval: false, // Desabilita refetch automático
      },
    },
  });
};

