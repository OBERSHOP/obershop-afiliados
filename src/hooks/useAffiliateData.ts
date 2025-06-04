'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useInfluencerStore } from '@/store/influencerStore';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/apiHandler';

export function useAffiliateData() {
  const sessionId = useAuthStore((s) => s.sessionId);
  const influencerData = useInfluencerStore((s) => s.influencer);
  const setInfluencerData = useInfluencerStore((s) => s.setInfluencer);

  return useQuery({
    queryKey: ['affiliate-data'],
    queryFn: async () => {
      try {
        // Tentamos primeiro a chamada normal
        const response = await apiClient.get('/influencer', {
          headers: {
            'Session-Id': sessionId || '',
          },
        });

        const newData = response.data;

        // Preserva o profilePicture se já existir no store e não vier da API
        if (
          newData &&
          influencerData?.profilePicture &&
          !newData.profilePicture
        ) {
          newData.profilePicture = influencerData.profilePicture;
        }

        if (JSON.stringify(influencerData) !== JSON.stringify(newData)) {
          setInfluencerData(newData);
        }

        return newData;
      } catch (error) {
        console.error('Erro ao buscar dados do afiliado (CORS):', error);

        // Se já temos dados no store, retornamos eles
        if (influencerData) {
          console.log('Usando dados do store como fallback');
          return influencerData;
        }

        // Se não temos dados no store, tentamos uma abordagem alternativa
        // usando o endpoint que sabemos que funciona
        try {
          console.log('Tentando obter dados via endpoint alternativo');
          const altResponse = await api.get('/items-sales/influencer-info', {
            headers: {
              'Session-Id': sessionId || '',
            },
          });

          // Se este endpoint retornar os dados do influencer, usamos eles
          if (altResponse.data) {
            setInfluencerData(altResponse.data);
            return altResponse.data;
          }
        } catch (altError) {
          console.error('Erro na abordagem alternativa:', altError);
        }

        // Se tudo falhar, criamos um objeto mínimo com os dados do usuário
        const user = useAuthStore.getState().user;
        const fallbackData = {
          id: user?.id || 'unknown',
          fullName: user?.fullName || 'Usuário',
          email: user?.email || '',
          cpf: '',
          // Outros campos podem ser adicionados conforme necessário
        };

        setInfluencerData(fallbackData);
        return fallbackData;
      }
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: false,
  });
}
