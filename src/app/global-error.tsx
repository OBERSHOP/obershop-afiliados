'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para serviço de monitoramento
    console.error('Erro global na aplicação:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Erro Crítico</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Algo deu muito errado</h2>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro crítico na aplicação. Nossa equipe foi notificada.
            </p>
            <Button 
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}