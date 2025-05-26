"use client";

import { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import Footer from "@/components/common/Footer/Footer";
import { Header } from "@/components/common/Header/Header";
import { SidebarProvider} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/common/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { allowed, isVerifying } = useRoleGuard("ADMIN");

  if (isVerifying || !allowed) return <LoadingAnimation />;

  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  );
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div
        className="flex flex-col transition-all duration-300 w-full"
      >
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
