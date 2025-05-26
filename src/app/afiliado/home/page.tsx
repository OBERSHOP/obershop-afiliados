'use client';

import { useState } from 'react';
import { useAffiliateSales } from '@/hooks/useAffiliateSales';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { useBalance } from '@/hooks/useBalance';
import { Eye, EyeOff, TrendingUp, ShoppingBag, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Home() {
  const [showValues, setShowValues] = useState([false, false, false]);

  useAffiliateData();

  const {
    data: sales,
    isLoading: loadingSales,
    isError: errorSales,
  } = useAffiliateSales();

  const { data: balance } = useBalance(true);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthSales =
    sales?.filter((sale) => {
      const date = new Date(sale.dateSale);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    }) ?? [];

  const formatValue = (val: number, index: number) =>
    showValues[index] ? `R$ ${val.toFixed(2)}` : 'R$ *****';

  const toggleValue = (index: number) => {
    setShowValues((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  // Dados para o gráfico de metas
  const goalAmount = 500;
  const currentAmount = currentMonthSales.reduce(
    (acc, sale) => acc + sale.priceSale,
    0,
  );
  const goalProgress = Math.min(
    Math.round((currentAmount / goalAmount) * 100),
    100,
  );

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Cards de saldo no topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Saldo Liberado */}
        <Card className="bg-gradient-to-r from-green-500 to-green-700 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="rounded-full bg-white/20 p-1.5">
                <ShoppingBag size={18} />
              </div>
              <button
                onClick={() => toggleValue(0)}
                className="text-white/80 hover:text-white"
              >
                {showValues[0] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/80">Saldo Liberado</p>
              <p className="text-xl font-bold">
                {formatValue(balance?.balanceAvailable || 0, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Saldo Bloqueado */}
        <Card className="bg-gradient-to-r from-red-400 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="rounded-full bg-white/20 p-1.5">
                <TrendingUp size={18} />
              </div>
              <button
                onClick={() => toggleValue(1)}
                className="text-white/80 hover:text-white"
              >
                {showValues[1] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/80">Saldo Bloqueado</p>
              <p className="text-xl font-bold">
                {formatValue(balance?.balanceBlocked || 0, 1)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Saldo a Liberar */}
        <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="rounded-full bg-white/20 p-1.5">
                <Target size={18} />
              </div>
              <button
                onClick={() => toggleValue(2)}
                className="text-white/80 hover:text-white"
              >
                {showValues[2] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-white/80">Saldo a Liberar</p>
              <p className="text-xl font-bold">
                {formatValue(balance?.balanceToRelease || 0, 2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 - Tabela de vendas recentes (2/3 do espaço) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Vendas mais recentes realizadas com seu cupom
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : errorSales ? (
                <p className="text-center text-red-500 py-4">
                  Erro ao carregar vendas.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales && sales.length > 0 ? (
                      sales.slice(0, 5).map((sale) => (
                        <TableRow key={sale.orderId}>
                          <TableCell className="font-medium">
                            #{sale.orderId}
                          </TableCell>
                          <TableCell>{formatDate(sale.dateSale)}</TableCell>
                          <TableCell>R$ {sale.priceSale.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            R$ {sale.commission.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Nenhuma venda encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2 - Card de metas (1/3 do espaço) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Metas do Mês</CardTitle>
              <CardDescription>Acompanhe seu progresso mensal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meta de vendas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Meta de Vendas</p>
                  <p className="text-sm text-muted-foreground">
                    {currentAmount.toFixed(2)} / {goalAmount.toFixed(2)}
                  </p>
                </div>
                <Progress value={goalProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {goalProgress}% da meta mensal atingida
                </p>
              </div>

              {/* Estatísticas populares */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold">Produtos Em Alta</h4>

                <div className="space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Manta de microfibra flannel</p>
                      <p className="font-semibold">R$39.90</p>
                      
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>34% Mais barato</span>
                    </div>
                    <div className="mt-2 relative h-8">
                      <svg className="w-full h-full" viewBox="0 0 100 20">
                        <path
                          d="M0,10 Q10,5 20,12 T40,8 T60,15 T80,5 T100,10"
                          fill="rgba(168, 85, 247, 0.2)"
                          stroke="rgba(168, 85, 247, 0.5)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Pano Multiuso Wiper 30x37,5</p>
                      <p className="font-semibold">R$31.99</p>
                      
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1">

                    </div>
                    <div className="mt-2 relative h-8">
                      <svg className="w-full h-full" viewBox="0 0 100 20">
                        <path
                          d="M0,10 Q10,5 20,12 T40,8 T60,15 T80,5 T100,10"
                          fill="rgba(168, 85, 247, 0.2)"
                          stroke="rgba(168, 85, 247, 0.5)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
