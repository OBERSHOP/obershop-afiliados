import { useAuthUser } from "@/store/authStore";
import { hasPermission } from "@/lib/rbac";
import type { RolePrivileges } from "@/services/authService";

export const useAccess = (section: keyof RolePrivileges['privileges']) => {
  const user = useAuthUser();
  return hasPermission(user, section);
};
