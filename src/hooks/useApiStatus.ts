import { create } from 'zustand';

type ApiStatusStore = {
  isLoading: boolean;
  setLoading: (status: boolean) => void;
};

export const useApiStatusStore = create<ApiStatusStore>((set) => ({
  isLoading: false,
  setLoading: (status) => set({ isLoading: status }),
}));