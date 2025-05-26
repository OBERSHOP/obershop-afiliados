'use client';

import { useHasHydrated } from '@/store/authStore';
import LoadingAnimation from './LoadingAnimation';

export function GlobalLoading() {
  const hydrated = useHasHydrated();

  if (!hydrated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return null;
}
