"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  HandCoins,
  Headset,
  BarChart,
  Users,
  X,
  LogOut,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/../public/favicon.ico";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

export function AffiliateSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const handleLogout = useLogout();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group/sidebar">
      <div className="bg-sidebar-primary h-full flex flex-col justify-between">
        {/* Header */}
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="Logo" width={32} height={32} />
            {!collapsed && (
              <div className="flex flex-col w-full">
                <span className="text-lg font-bold">OBERSHOP</span>
                <span className="text-muted-foreground text-sm">Afiliado</span>
              </div>
            )}
            <button
              className="md:hidden p-1 rounded hover:bg-destructive cursor-pointer"
              onClick={() => setOpenMobile(false)}
            >
              <X className="text-muted" size={20} />
            </button>
          </div>
        </SidebarHeader>

        {/* Menu */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="w-full py-4 gap-4">
              <SidebarItem
                icon={<Home size={20} />}
                label="Início"
                href="/afiliado/home"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<HandCoins size={20} />}
                label="Vendas"
                href="/afiliado/vendas"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<FileText size={20} />}
                label="Extrato"
                href="/afiliado/extrato"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<CreditCard size={20} />}
                label="Pagamentos"
                href="/afiliado/pagamentos"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<Users size={20} />}
                label="Minha Equipe"
                href="/afiliado/equipe"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<BarChart size={20} />}
                label="Ranking"
                href="/afiliado/ranking"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<Settings size={20} />}
                label="Configurações"
                href="/afiliado/config"
                collapsed={collapsed}
              />

              <SidebarItem
                icon={<Headset size={20} />}
                label="Suporte"
                href="/afiliado/suporte"
                collapsed={collapsed}
              />
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              {!collapsed && (
                <div>
                  <div className="text-sm font-medium">Fulano da Silva</div>
                  <div className="text-xs text-muted-foreground">CUPOM123</div>
                </div>
              )}
            </div>

            <Button
              variant="destructive"
              size={collapsed ? "icon" : "default"}
              className="w-full mt-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              {!collapsed && <span className="ml-2">Sair</span>}
            </Button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuItem className="w-full transition">
      <SidebarMenuButton asChild>
        <Link
          href={href}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "hover:bg-muted"
          }`}
        >
          {icon}
          {!collapsed && <span className="text-sm">{label}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
