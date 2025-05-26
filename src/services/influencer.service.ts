import { api } from '@/lib/api';
import { influencerPagedSchema } from '@/schema/influencer.schema';

export async function getInfluencersPaged(params: { page?: number; search?: string }) {
  const response = await api.get('/influencer/paged', { params });
  return influencerPagedSchema.parse(response.data);
}
