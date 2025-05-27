import { User } from "@/store/authStore";
import type { Privileges } from "@/store/authStore";

export const hasPermission = (
  user: User | null,
  section: keyof Privileges
): boolean => {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  return !!user.roleAccess?.privileges?.[section];
};
