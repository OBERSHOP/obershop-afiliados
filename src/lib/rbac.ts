import { User } from "@/store/authStore";
import type { RolePrivileges } from "@/services/authService";

export const hasPermission = (
  user: User | null,
  section: keyof RolePrivileges['privileges']
): boolean => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  return !!user.roleAccess?.privileges?.[section];
};
