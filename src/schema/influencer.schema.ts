import { z } from 'zod';

export const influencerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const influencerPagedSchema = z.object({
  data: z.array(influencerSchema),
  total: z.number(),
});

export type Influencer = z.infer<typeof influencerSchema>;
export type InfluencerPaged = z.infer<typeof influencerPagedSchema>;
