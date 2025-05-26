'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Api } from '@/lib/apiHandler';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, User } from 'lucide-react';

// Tipos
interface Influencer {
  id: string;
  fullName: string;
  email: string;
  codeCoupon: string;
  totalSales: number;
  totalCommission: number;
  salesCount: number;
  active: boolean;
  position?: number;
}

export default function RankingPage() {
  const { sessionId } = useAuthStore();
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('totalSales');

  // Dados mockados para exemplo
  const mockInfluencers: Influencer[] = [
    {
      id: '1',
      fullName: 'João Silva',
      email: 'joao@example.com',
      codeCoupon: 'JOAO10',
      totalSales: 45750.8,
      totalCommission: 4575.08,
      salesCount: 23,
      active: true,
      position: 1,
    },
    {
      id: '2',
      fullName: 'Maria Oliveira',
      email: 'maria@example.com',
      codeCoupon: 'MARIA20',
      totalSales: 38920.5,
      totalCommission: 3892.05,
      salesCount: 19,
      active: true,
      position: 2,
    },
    {
      id: '3',
      fullName: 'Carlos Santos',
      email: 'carlos@example.com',
      codeCoupon: 'CARLOS15',
      totalSales: 32450.75,
      totalCommission: 3245.07,
      salesCount: 16,
      active: true,
      position: 3,
    },
    {
      id: '4',
      fullName: 'Ana Pereira',
      email: 'ana@example.com',
      codeCoupon: 'ANA25',
      totalSales: 28750.3,
      totalCommission: 2875.03,
      salesCount: 14,
      active: false,
      position: 4,
    },
    {
      id: '5',
      fullName: 'Lucas Mendes',
      email: 'lucas@example.com',
      codeCoupon: 'LUCAS30',
      totalSales: 25320.45,
      totalCommission: 2532.04,
      salesCount: 12,
      active: true,
      position: 5,
    },
    {
      id: '6',
      fullName: 'Juliana Costa',
      email: 'juliana@example.com',
      codeCoupon: 'JULI15',
      totalSales: 22180.9,
      totalCommission: 2218.09,
      salesCount: 11,
      active: true,
      position: 6,
    },
    {
      id: '7',
      fullName: 'Roberto Alves',
      email: 'roberto@example.com',
      codeCoupon: 'ROBERTO20',
      totalSales: 18450.6,
      totalCommission: 1845.06,
      salesCount: 9,
      active: true,
      position: 7,
    },
    {
      id: '8',
      fullName: 'Fernanda Lima',
      email: 'fernanda@example.com',
      codeCoupon: 'FERN10',
      totalSales: 15780.25,
      totalCommission: 1578.02,
      salesCount: 8,
      active: false,
      position: 8,
    },
    {
      id: '9',
      fullName: 'Ricardo Souza',
      email: 'ricardo@example.com',
      codeCoupon: 'RICA25',
      totalSales: 12450.7,
      totalCommission: 1245.07,
      salesCount: 6,
      active: true,
      position: 9,
    },
    {
      id: '10',
      fullName: 'Camila Ferreira',
      email: 'camila@example.com',
      codeCoupon: 'CAMI30',
      totalSales: 9820.35,
      totalCommission: 982.03,
      salesCount: 5,
      active: true,
      position: 10,
    },
  ];

  // Simulação de chamada à API
  const {
    data: influencers = mockInfluencers,
    isLoading,
    isError,
  } = useQuery<Influencer[]>({
    queryKey: ['influencers-ranking', timeRange, sortBy],
    queryFn: async () => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.get("/influencer/ranking", {
      //   headers: { "Session-Id": sessionId || "" },
      //   params: { timeRange, sortBy }
      // });
      // return response.data;

      // Simulação de ordenação
      return [...mockInfluencers].sort((a, b) => {
        if (sortBy === 'totalSales') return b.totalSales - a.totalSales;
        if (sortBy === 'totalCommission')
          return b.totalCommission - a.totalCommission;
        if (sortBy === 'salesCount') return b.salesCount - a.salesCount;
        return 0;
      });
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // ID do usuário atual (simulado)
  const currentUserId = '5';

  // Encontrar a posição do usuário atual
  const currentUserPosition =
    influencers.findIndex((inf) => inf.id === currentUserId) + 1;

  // Renderizar medalha para os 3 primeiros
  const renderRankBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return (
      <span className="text-muted-foreground font-medium">{position}</span>
    );
  };

  // Função para exibir nome e cupom com blur para outros usuários
  const renderName = (influencer: Influencer) => {
    if (influencer.id === currentUserId) {
      return (
        <span className="text-primary font-medium">
          {influencer.fullName} <span className="text-xs ml-1">(Você)</span>
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <User size={16} className="text-muted-foreground" />
        <span className="blur-[3px] select-none">Afiliado</span>
      </div>
    );
  };

  const renderCoupon = (influencer: Influencer) => {
    if (influencer.id === currentUserId) {
      return <span>{influencer.codeCoupon}</span>;
    }

    return <span className="blur-[3px] select-none">Cupom</span>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Card de posição do usuário */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Sua posição no ranking</h2>
              <p className="text-sm opacity-80">
                Período:{' '}
                {timeRange === 'all'
                  ? 'Todo período'
                  : timeRange === 'month'
                  ? 'Último mês'
                  : timeRange === 'quarter'
                  ? 'Último trimestre'
                  : 'Último ano'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{currentUserPosition}º</div>
              <p className="text-sm opacity-80">de {influencers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Ranking de Afiliados</CardTitle>
              <CardDescription>
                Classificação dos afiliados por desempenho de vendas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalSales">Valor de vendas</SelectItem>
                  <SelectItem value="salesCount">Número de vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center p-8">
              <p className="text-red-500">
                Erro ao carregar dados. Tente novamente.
              </p>
            </div>
          ) : (
            <>
              {/* Tabela para desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos.</TableHead>
                      <TableHead>Afiliado</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhum afiliado encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      influencers.map((influencer, index) => (
                        <TableRow
                          key={influencer.id}
                          className={`${
                            influencer.id === currentUserId
                              ? 'bg-primary/10'
                              : index < 3
                              ? 'bg-muted/30'
                              : ''
                          }`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex justify-center items-center">
                              {renderRankBadge(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell>{renderName(influencer)}</TableCell>
                          <TableCell>{renderCoupon(influencer)}</TableCell>
                          <TableCell className="text-right">
                            {influencer.salesCount}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R${' '}
                            {influencer.totalSales.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Cards para mobile */}
              <div className="grid gap-4 md:hidden">
                {influencers.length === 0 ? (
                  <div className="text-center py-8">
                    Nenhum afiliado encontrado.
                  </div>
                ) : (
                  influencers.map((influencer, index) => (
                    <Card
                      key={influencer.id}
                      className={`${
                        influencer.id === currentUserId
                          ? 'border-primary'
                          : index < 3
                          ? 'border-primary/30'
                          : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted">
                              {renderRankBadge(index + 1)}
                            </div>
                            <div>
                              {influencer.id === currentUserId ? (
                                <>
                                  <p className="font-medium text-primary">
                                    {influencer.fullName}{' '}
                                    <span className="text-xs">(Você)</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {influencer.codeCoupon}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="font-medium flex items-center gap-1">
                                    <User
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                    <span className="blur-[3px] select-none">
                                      Afiliado
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="blur-[3px] select-none">
                                      Cupom
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-lg font-bold">{index + 1}º</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Vendas
                            </p>
                            <p className="font-medium">
                              {influencer.salesCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total
                            </p>
                            <p className="font-medium">
                              R${' '}
                              {influencer.totalSales.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
