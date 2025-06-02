// /store/influencerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Influencer {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  cnpj?: string;
  phone?: string;
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  streetAddress?: string;
  numberAddress?: string;
  profilePicture?: string;
  codeCoupon?: string;
  leader?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InfluencerState {
  influencer: Influencer | null;
  selectedAvatar: string | null;
  setInfluencer: (influencer: Influencer | null) => void;
  setSelectedAvatar: (avatar: string | null) => void;
  updateProfilePicture: (avatarUrl: string) => void;
  clearInfluencer: () => void;
}

export const useInfluencerStore = create<InfluencerState>()(
  persist(
    (set, get) => ({
      influencer: null,
      selectedAvatar: null,
      setInfluencer: (influencer) => set({ influencer }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      updateProfilePicture: (avatarUrl) => {
        const currentInfluencer = get().influencer;
        if (currentInfluencer) {
          set({
            influencer: {
              ...currentInfluencer,
              profilePicture: avatarUrl
            }
          });
        }
      },
      clearInfluencer: () => set({ influencer: null, selectedAvatar: null }),
    }),
    {
      name: 'influencer-storage',
      partialize: (state) => ({
        influencer: state.influencer,
        selectedAvatar: state.selectedAvatar,
      }),
    }
  )
);
