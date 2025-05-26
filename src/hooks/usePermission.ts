'use client';

import { useAuthStore } from '@/store/authStore';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const privileges = user?.roleAccess?.privileges;

  return {
    // Equipe
    canCreateTeam: !!privileges?.teamPrivilege?.teamCreate,
    canEditTeam: !!privileges?.teamPrivilege?.teamEdit,
    canViewTeam: !!privileges?.teamPrivilege?.teamView,

    // Pagamentos
    canCreatePayment: !!privileges?.paymentPrivilege?.paymentCreate,
    canEditPayment: !!privileges?.paymentPrivilege?.paymentEdit,
    canViewPayment: !!privileges?.paymentPrivilege?.paymentView,

    // Suporte
    canCreateSupport: !!privileges?.supportPrivilege?.supportCreate,
    canEditSupport: !!privileges?.supportPrivilege?.supportEdit,
    canViewSupport: !!privileges?.supportPrivilege?.supportView,
  };
}
