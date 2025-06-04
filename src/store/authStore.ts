import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Tipos mais específicos
export type UserRole = 'ADMIN' | 'USER';

export interface Privileges {
  teamPrivilege?: {
    teamCreate?: boolean;
    teamEdit?: boolean;
    teamView?: boolean;
  };
  paymentPrivilege?: {
    paymentCreate?: boolean;
    paymentEdit?: boolean;
    paymentView?: boolean;
  };
  supportPrivilege?: {
    supportCreate?: boolean;
    supportEdit?: boolean;
    supportView?: boolean;
  };
}

export interface User {
  id?: string;
  fullName: string;
  email?: string; // Adicionando email como propriedade opcional
  role: UserRole;
  roleAccess?: {
    id: string;
    name: string;
    privileges?: Privileges;
  };
}

interface AuthState {
  sessionId: string | null;
  user: User | null;
  hasHydrated: boolean;
  email?: string
}

interface AuthActions {
  setSessionId: (sessionId: string) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  updateUserField: <K extends keyof User>(key: K, value: User[K]) => void;
}

// Separando estado e ações
export const useAuthStore = create<AuthState & AuthActions>()(
  immer(
    persist(
      (set) => ({
        // Estado
        sessionId: null,
        user: null,
        hasHydrated: false,

        // Ações
        setSessionId: (sessionId) =>
          set((state) => {
            state.sessionId = sessionId;
          }),

        setUser: (user) =>
          set((state) => {
            state.user = user;
          }),

        clearSession: () =>
          set((state) => {
            state.sessionId = null;
            state.user = null;
          }),

        setHasHydrated: (value) =>
          set((state) => {
            state.hasHydrated = value;
          }),

        // Nova ação para atualizar campos específicos do usuário
        updateUserField: (key, value) =>
          set((state) => {
            if (state.user) {
              state.user[key] = value;
            }
          }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sessionId: state.sessionId,
          user: state.user,
        }), // Só persiste o que é necessário
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  ),
);

// Seletores otimizados para evitar re-renders desnecessários
export const useAuthSession = () => useAuthStore((state) => state.sessionId);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === 'ADMIN');
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.sessionId);
export const useHasHydrated = () => useAuthStore((state) => state.hasHydrated);
