import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Moon, Sun } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-10">
        <SidebarTrigger className="transition hover:scale-95 hover:bg-muted-foreground cursor-pointer">
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SidebarTrigger>
        <Breadcrumbs />
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme}
        className="rounded-full"
        aria-label="Alternar tema"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
