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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Search } from 'lucide-react';

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
}

export default function RankingPage() {
  const { sessionId } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
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
    },
  ];

  // Simulação de chamada à API
  const {
    data: influencers = mockInfluencers,
    isLoading,
    isError,
    refetch,
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

  // Filtrar por termo de busca
  const filteredInfluencers = influencers.filter(
    (inf) =>
      inf.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.codeCoupon.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Renderizar medalha para os 3 primeiros
  const renderRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return (
      <span className="text-muted-foreground font-medium">{index + 1}</span>
    );
  };

  // Status do influencer
  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-600 border-green-200"
      >
        Ativo
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-600 border-red-200"
      >
        Inativo
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Ranking de Influencers</CardTitle>
              <CardDescription>
                Classificação dos influencers por desempenho de vendas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar influencer..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                  <SelectItem value="totalCommission">Comissões</SelectItem>
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
              <Button onClick={() => refetch()} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              {/* Tabela para desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos.</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Vendas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInfluencers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhum influencer encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInfluencers.map((influencer, index) => (
                        <TableRow
                          key={influencer.id}
                          className={index < 3 ? 'bg-muted/30' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex justify-center items-center">
                              {renderRankBadge(index)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {influencer.fullName}
                            <div className="text-xs text-muted-foreground">
                              {influencer.email}
                            </div>
                          </TableCell>
                          <TableCell>{influencer.codeCoupon}</TableCell>
                          <TableCell>
                            {getStatusBadge(influencer.active)}
                          </TableCell>
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
                          <TableCell className="text-right text-green-600 font-medium">
                            R${' '}
                            {influencer.totalCommission.toLocaleString(
                              'pt-BR',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Cards para mobile */}
              <div className="grid gap-4 md:hidden">
                {filteredInfluencers.length === 0 ? (
                  <div className="text-center py-8">
                    Nenhum influencer encontrado.
                  </div>
                ) : (
                  filteredInfluencers.map((influencer, index) => (
                    <Card
                      key={influencer.id}
                      className={index < 3 ? 'border-primary/30' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted">
                              {renderRankBadge(index)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {influencer.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {influencer.email}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(influencer.active)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Cupom
                            </p>
                            <p className="font-medium">
                              {influencer.codeCoupon}
                            </p>
                          </div>
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
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Comissão
                            </p>
                            <p className="font-medium text-green-600">
                              R${' '}
                              {influencer.totalCommission.toLocaleString(
                                'pt-BR',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
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
