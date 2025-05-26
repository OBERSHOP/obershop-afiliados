'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateSessionId } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function useSessionValidator() {
  const sessionId = useAuthStore((s) => s.sessionId);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) {
      clearSession();
      router.push('/login');
      return;
    }

    validateSessionId(sessionId)
      .then((res) => {
        setUser({
          id: res.roleAccess?.id ?? '', // Se for USER, ainda vem o id aqui
          fullName: res.fullName,
          role: res.role,
          roleAccess: res.roleAccess ? {
            id: res.roleAccess.id,
            name: res.roleAccess.name,
          } : undefined,
        });
      })
      .catch((error) => {
        // Apenas desloga se for um erro específico de validação de sessão
        console.error('Erro na validação de sessão:', error);
        clearSession();
        toast.error("Sessão expirada. Faça login novamente.");
        router.push('/login');
      });
  }, [sessionId, setUser, clearSession, router]);
}
