import { useAuthStore } from '@/store/authStore';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const privileges = user?.roleAccess?.privileges;
  
  console.log('User privileges:', user?.role, privileges);
  
  // Para usuários ADMIN, conceder todos os privilégios automaticamente
  if (user?.role === 'ADMIN') {
    return {
      // Equipe
      canCreateTeam: true,
      canEditTeam: true,
      canViewTeam: true,

      // Pagamentos
      canCreatePayment: true,
      canEditPayment: true,
      canViewPayment: true,

      // Suporte
      canCreateSupport: true,
      canEditSupport: true,
      canViewSupport: true,
    };
  }
  
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
