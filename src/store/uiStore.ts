import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UiState {
  globalLoading: boolean;
  apiRequests: Record<string, boolean>;
  requestCount: number;
}

interface UiActions {
  showGlobalLoading: () => void;
  hideGlobalLoading: () => void;
  startApiRequest: (requestId: string) => void;
  finishApiRequest: (requestId: string) => void;
  resetApiRequests: () => void;
}

export const useUiStore = create<UiState & UiActions>()(
  immer((set) => ({
    globalLoading: false,
    apiRequests: {},
    requestCount: 0,

    showGlobalLoading: () =>
      set((state) => {
        state.globalLoading = true;
      }),

    hideGlobalLoading: () =>
      set((state) => {
        state.globalLoading = false;
      }),

    startApiRequest: (requestId: string) =>
      set((state) => {
        if (!state.apiRequests[requestId]) {
          state.apiRequests[requestId] = true;
          state.requestCount += 1;
        }
      }),

    finishApiRequest: (requestId: string) =>
      set((state) => {
        if (state.apiRequests[requestId]) {
          delete state.apiRequests[requestId];
          state.requestCount = Math.max(0, state.requestCount - 1);
        }
      }),

    resetApiRequests: () =>
      set((state) => {
        state.apiRequests = {};
        state.requestCount = 0;
      }),
  }))
);
