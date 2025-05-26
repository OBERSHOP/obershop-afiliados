// src/hooks/useAffiliateSales.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiHandler';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const itemSchema = z.object({
  id: z.string(),
  idOrder: z.number(),
  idProduct: z.number(),
  codeProduct: z.string(),
  nameProduct: z.string(),
  quantityProduct: z.number(),
  priceProduct: z.number(),
});

const saleSchema = z.object({
  priceSale: z.number(),
  commission: z.number(),
  dateSale: z.string(),
  orderId: z.number(),
  itemsSales: z.array(itemSchema),
});

const responseSchema = z.array(saleSchema);

export type Sale = z.infer<typeof saleSchema>;

export function useAffiliateSales(enabled = true) {
  const sessionId = useAuthStore((s) => s.sessionId);
  
  return useQuery<Sale[]>({
    queryKey: ['affiliate-sales'],
    queryFn: async () => {
      const response = await apiClient.get('/items-sales', {
        headers: {
          'Session-Id': sessionId || '',
        },
      });
      return responseSchema.parse(response.data);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
