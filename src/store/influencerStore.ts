// /store/influencerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Influencer {
  id: string;
  fullName: string;
  email: string;
  codeCoupon: string;
  phone: string;
  entryDate: string;
  leader: string;
  active: boolean;
  profilePicture?: string;
}

interface InfluencerStore {
  influencer: Influencer | null;
  selectedAvatar: string | null;
  setInfluencer: (data: Influencer) => void;
  setSelectedAvatar: (avatar: string) => void;
  clearInfluencer: () => void;
}

export const useInfluencerStore = create<InfluencerStore>()(
  persist(
    (set) => ({
      influencer: null,
      selectedAvatar: null,
      setInfluencer: (data) => set({ influencer: data }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      clearInfluencer: () => set({ influencer: null }),
    }),
    {
      name: "influencer-storage",
    }
  )
);
