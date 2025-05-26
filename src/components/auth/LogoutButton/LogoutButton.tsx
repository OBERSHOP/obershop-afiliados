'use client';

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useLoadingStore } from "@/store/loadingStore";

export function LogoutButton() {
  const { sessionId, clearSession } = useAuthStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const router = useRouter();

  const handleLogout = async () => {
    if (!sessionId) return;

    showLoading(); 

    try {
      await logout(sessionId);
      clearSession();
      toast.success("Logout efetuado com sucesso");
      router.replace("/login");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao realizar logout";
      toast.error(message);
    } finally {
      hideLoading(); 
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      Sair
    </Button>
  );
}
