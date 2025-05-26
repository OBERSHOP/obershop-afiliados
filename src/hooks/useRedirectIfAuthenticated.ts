'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useRedirectIfAuthenticated() {
  const { sessionId, user, hasHydrated } = useAuthStore();
  const router = useRouter();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (sessionId && user) {
      const path = user.role === 'ADMIN' ? '/admin/home' : '/afiliado/home';
      router.replace(path);
      return;
    }

    setReady(true);
  }, [hasHydrated, sessionId, user, router]);


  if (!hasHydrated) return false;

  return ready;
}
