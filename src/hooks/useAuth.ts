// /hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/authService';

export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: login,
  });

  return { loginMutation };
};
