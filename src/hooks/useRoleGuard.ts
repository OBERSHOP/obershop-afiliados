"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { validateSessionId } from "@/services/authService";
import { toast } from "sonner";

export function useRoleGuard(expectedRole: "ADMIN" | "USER") {
  const { sessionId, user, setUser, clearSession, hasHydrated } = useAuthStore();
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    const verify = async () => {
      if (!sessionId) {
        console.log('useRoleGuard: Sem sessionId, redirecionando para login');
        toast.error("Você precisa estar logado.");
        router.replace("/login");
        return;
      }

      try {
        // Se já temos o usuário com o papel correto, não precisamos revalidar
        if (user && user.role === expectedRole) {
          console.log(`useRoleGuard: Usuário já tem papel ${expectedRole}, permitindo acesso`);
          setAllowed(true);
          setIsVerifying(false);
          return;
        }

        console.log(`useRoleGuard: Validando sessionId para papel ${expectedRole}`);
        const userData = await validateSessionId(sessionId);
        console.log('useRoleGuard: Dados do usuário recebidos:', userData);
        
        setUser(userData);

        if (userData.role !== expectedRole) {
          console.log(`useRoleGuard: Papel incorreto. Esperado: ${expectedRole}, Recebido: ${userData.role}`);
          toast.error("Você não tem permissão para acessar esta página.");
          
          // Redirecionar para a página correta com base no papel do usuário
          const correctPath = userData.role === 'ADMIN' ? '/admin/home' : '/afiliado/home';
          router.replace(correctPath);
          return;
        }

        console.log('useRoleGuard: Acesso permitido');
        setAllowed(true);
      } catch (error) {
        // Apenas desloga se for um erro específico de validação de sessão
        console.error('useRoleGuard: Erro na validação:', error);
        clearSession();
        toast.error("Sessão expirada. Faça login novamente.");
        router.replace("/login");
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [hasHydrated, sessionId, expectedRole, router, setUser, clearSession, user]);

  return { allowed, isVerifying };
}
