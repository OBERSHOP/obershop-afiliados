import { useAuthUser } from '@/store/authStore';
import { hasPermission } from '@/lib/rbac';
import type { Privileges } from '@/store/authStore';

export const useAccess = (section: keyof Privileges) => {
  const user = useAuthUser();
  return hasPermission(user, section);
};
