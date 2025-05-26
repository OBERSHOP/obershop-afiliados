// /src/components/common/LoadingAnimation.tsx
"use client";

import { Loader } from "lucide-react";

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
