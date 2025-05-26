// hooks/useLogout.ts
import { useAuthStore } from "@/store/authStore";
import { useInfluencerStore } from "@/store/influencerStore";
import { logout as apiLogout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const { sessionId, clearSession } = useAuthStore();

  const handleLogout = async () => {
    if (!sessionId) return;

    try {
      await apiLogout(sessionId);
      clearSession();       
      toast.success("Logout efetuado com sucesso.");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao realizar logout.";
      toast.error(message);
      console.error("Logout error:", err);
    }
  };

  return handleLogout;
}
