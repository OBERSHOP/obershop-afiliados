'use client';

import { ReactNode, useEffect } from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import Footer from '@/components/common/Footer/Footer';
import { AdminSidebar } from '@/components/common/AdminSidebar/AdminSidebar';
import { Header } from '@/components/common/Header/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import { useAffiliateData } from '@/hooks/useAffiliateData';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { allowed, isVerifying } = useRoleGuard("ADMIN");
  const { data: affiliateData, isLoading, isError } = useAffiliateData();

  useEffect(() => {
    console.log('AdminLayout: Dados do afiliado:', affiliateData);
    if (isError) {
      console.error('AdminLayout: Erro ao carregar dados do afiliado');
    }
  }, [affiliateData, isError]);

  if (isVerifying || isLoading) return <LoadingAnimation />;
  if (!allowed) return <LoadingAnimation />;

  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  );
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  useSessionValidator();

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
