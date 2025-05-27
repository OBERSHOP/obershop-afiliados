'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useInfluencerStore } from '@/store/influencerStore';
import { api } from '@/lib/api';

export function useAffiliateData() {
  const sessionId = useAuthStore((s) => s.sessionId);
const influencerData = useInfluencerStore((s) => s.influencer);
const setInfluencerData = useInfluencerStore((s) => s.setInfluencer);

  return useQuery({
    queryKey: ['affiliate-data'],
    queryFn: async () => {
      const response = await api.get('/influencer', {
        headers: {
          'Session-Id': sessionId || '',
        },
      });

      const newData = response.data;

      if (JSON.stringify(influencerData) !== JSON.stringify(newData)) {
        setInfluencerData(newData);
      }

      return newData;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
