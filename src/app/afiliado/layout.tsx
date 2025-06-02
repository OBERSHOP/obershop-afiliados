'use client';

import { ReactNode, useEffect } from 'react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import Footer from '@/components/common/Footer/Footer';
import { AffiliateSidebar } from '@/components/common/AffilliateSidebar/AffilliateSidebar';
import { Header } from '@/components/common/Header/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import { useAffiliateData } from '@/hooks/useAffiliateData';

export default function AfiliadoLayout({ children }: { children: ReactNode }) {
  const { allowed, isVerifying } = useRoleGuard('USER');
  const user = useAuthStore(state => state.user);
  const { data: affiliateData, isLoading } = useAffiliateData();

  useSessionValidator();
  
  // Log para depuração
  useEffect(() => {
    console.log('AfiliadoLayout: Renderizando com usuário:', user);
    console.log('AfiliadoLayout: Dados do afiliado:', affiliateData);
  }, [user, affiliateData]);

  if (isVerifying || isLoading) {
    console.log('AfiliadoLayout: Verificando permissões ou carregando dados...');
    return <LoadingAnimation />;
  }
  
  if (!allowed) {
    console.log('AfiliadoLayout: Acesso não permitido');
    return <LoadingAnimation />;
  }

  console.log('AfiliadoLayout: Acesso permitido, renderizando conteúdo');
  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  );
}

function LayoutWithSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AffiliateSidebar />
      <div className="flex flex-col transition-all duration-300 w-full">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
