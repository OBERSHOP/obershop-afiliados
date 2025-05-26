import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiHandler';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const balanceSchema = z.object({
  balanceAvailable: z.number(),
  balanceBlocked: z.number(),
  balanceToRelease: z.number(),
});

type BalanceResponse = z.infer<typeof balanceSchema>;

export function useBalance(enabled = true) {
  const sessionId = useAuthStore((s) => s.sessionId);

  return useQuery<BalanceResponse>({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await apiClient.get('/balances', {
        headers: {
          'Session-Id': sessionId || '',
        },
      });

      return balanceSchema.parse(res.data);
    },
    enabled: enabled && !!sessionId,
    staleTime: 5 * 60 * 1000,
  });
}
