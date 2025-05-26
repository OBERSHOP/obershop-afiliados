// "use client";

// import { createContext, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { validateSessionId } from "@/services/authService";
// import { useAuthStore } from "@/store/authStore";

// interface AuthContextType {
//   isAuthenticated: boolean;
//   isAdmin: boolean;
//   isLoading: boolean;
//   logout: () => void;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(
//   undefined
// );

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const { sessionId, setUser, user, clearSession, hasHydrated } =
//     useAuthStore();
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     if (!hasHydrated) return;
//     let mounted = true;

//     const verify = async () => {
//       const isProtected =
//         typeof window !== "undefined" &&
//         (window.location.pathname.startsWith("/admin") ||
//           window.location.pathname.startsWith("/afiliado"));

//       if (!sessionId) {
//         if (isProtected) router.push("/login");
//         if (mounted) setIsLoading(false);
//         return;
//       }

//       try {
//         const user = await validateSessionId(sessionId);
//         if (mounted) setUser(user);
//       } catch (err: unknown) {
//         const errorMessage =
//           err instanceof Error ? err.message : "Erro ao validar sessão";
//         console.error(errorMessage);
//         clearSession();
//         if (isProtected) router.push("/login");
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     };

//     verify();

//     return () => {
//       mounted = false;
//     };
//   }, [hasHydrated, sessionId, clearSession, setUser, router]);

//   const logout = () => {
//     clearSession();
//     router.push("/login");
//   };

//   const isAuthenticated = !!sessionId;
//   const isAdmin = user?.role === "ADMIN";

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, isAdmin, isLoading, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }
