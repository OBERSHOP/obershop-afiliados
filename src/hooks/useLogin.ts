import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const { setSessionId } = useAuthStore.getState();

  return useMutation({
    mutationFn: login,
    onSuccess: (data: { sessionId: string }) => {
      setSessionId(data.sessionId);
    },
  });
}
