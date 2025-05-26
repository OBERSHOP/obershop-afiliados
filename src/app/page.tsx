// /src/app/page.tsx
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100 px-4">
      <div className="text-center space-y-6 max-w-xl">
        <h1 className="text-4xl font-bold text-slate-800">
          Bem-vindo ao Painel de Afiliados
        </h1>
        <p className="text-slate-600 text-lg">
          Gerencie suas vendas, pagamentos e equipe de forma inteligente e segura.
        </p>

        <Link href="/login">
          <Button className="text-white bg-blue-600 hover:bg-blue-700">
            Acessar Painel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
