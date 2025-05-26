'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import Image from 'next/image';
import Trophy from '@/../public/image/trophy.png';

type ChartData = {
  date: string;
  vendas: number;
  comissoes: number;
  fretes: number;
};

type InfluencerStatus = {
  name: string;
  value: number;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }[];
  label?: string;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    percent: number;
    payload: InfluencerStatus;
  }[];
};

type Influencer = {
  id: string;
  name: string;
  totalVendas: number;
  couponCode: string;
};

const influencerData: InfluencerStatus[] = [
  { name: 'Ativos', value: 28, color: '#10B981' },
  { name: 'Inativos', value: 14, color: '#F43F5E' },
];

const influencers: Influencer[] = [
  { id: '1', name: 'João Silva', totalVendas: 12345, couponCode: 'JOAO10' },
  { id: '2', name: 'Maria Lima', totalVendas: 11200, couponCode: 'MARIA20' },
  { id: '3', name: 'Carlos Souza', totalVendas: 9800, couponCode: 'CARLOS30' },
];

export default function AdminDashboardHome() {
  const [days, setDays] = useState('30');
  const [filter, setFilter] = useState('todos');
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const simulateFetch = () => {
      const today = new Date();
      const newData: ChartData[] = Array.from(
        { length: Number(days) },
        (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          return {
            date: d.toLocaleDateString('pt-BR'),
            vendas: Math.floor(Math.random() * 1000),
            comissoes: Math.floor(Math.random() * 400),
            fretes: Math.floor(Math.random() * 200),
          };
        },
      ).reverse();
      setData(newData);
    };

    simulateFetch();
  }, [days]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'vendas'
                  ? 'Vendas'
                  : entry.dataKey === 'comissoes'
                  ? 'Comissões'
                  : 'Fretes'}
              </span>
            </div>
            <span className="text-sm font-medium">
              R$ {entry.value.toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const PieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].payload.color }}
            />
            <span className="text-sm">{payload[0].name}</span>
          </div>
          <span className="text-sm font-medium">
            {payload[0].value} ({Math.round(payload[0].percent * 100)}%)
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">128</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Valor Total das Vendas</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      className="text-muted-foreground cursor-pointer"
                      size={16}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Valor total das vendas com fretes menos descontos.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">R$ 35.492,75</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">42</p>
          </CardContent>
        </Card>
      </div>

      <div>
        {/* Gráficos */}
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full lg:w-[55">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center pl-5">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Período</label>
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Últimos 365 dias</SelectItem>
                    <SelectItem value="9999">Tempo todo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Exibir</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="comissoes">Comissões</SelectItem>
                    <SelectItem value="fretes">Fretes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardHeader>
              <CardTitle>Desempenho de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient
                      id="colorVendas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorComissoes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorFretes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  {(filter === 'todos' || filter === 'vendas') && (
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorVendas)"
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(filter === 'todos' || filter === 'comissoes') && (
                    <Area
                      type="monotone"
                      dataKey="comissoes"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#colorComissoes)"
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(filter === 'todos' || filter === 'fretes') && (
                    <Area
                      type="monotone"
                      dataKey="fretes"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fill="url(#colorFretes)"
                      activeDot={{ r: 6 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="w-full lg:w-[40%] flex flex-col items-center justify-center overflow-hidden">
            <CardHeader className="w-full text-center">
              <CardTitle>Status dos Influencers</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pt-4 w-full flex justify-center items-center">
              <ChartContainer
                config={{}}
                className="h-full w-full flex justify-center"
              >
                <ResponsiveContainer width="95%" height="100%">
                  <PieChart margin={{ right: 20, left: 20 }}>
                    <Pie
                      data={influencerData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {influencerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      layout="horizontal"
                      iconType="circle"
                      iconSize={10}
                      formatter={(value, entry, index) => {
                        const { payload } = entry;
                        return (
                          <span
                            style={{ color: payload.color, marginLeft: '5px' }}
                          >
                            {payload.name}: {payload.value}
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Tabela */}
          <div className="w-full lg:w-[65%]">
            <Card>
              <CardHeader>
                <CardTitle>Top Influencers</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2">Nome</th>
                      <th className="py-2">Vendas</th>
                      <th className="py-2">Cupom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {influencers.map((inf) => (
                      <tr key={inf.id} className="border-b hover:bg-muted/20">
                        <td className="py-2">{inf.name}</td>
                        <td className="py-2 font-medium">
                          R$ {inf.totalVendas.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2">{inf.couponCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Destaque do melhor influencer */}
          <div className="w-full lg:w-[35%] ">
            <Card className="bg-sidebar-primary text-muted-foreground h-full">
              <CardHeader>
                <CardTitle className="text-lg">Campeão de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 flex space-between">
                <div>
                  <p className="text-2xl font-bold">{influencers[0].name}</p>
                  <p>
                    Cupom:{' '}
                    <span className="font-semibold">
                      {influencers[0].couponCode}
                    </span>
                  </p>
                  <p>
                    Total:{' '}
                    <span className="font-semibold">
                      R$ {influencers[0].totalVendas.toLocaleString('pt-BR')}
                    </span>
                  </p>
                </div>
                <Image src={Trophy} alt="OBER shop" className="w-24 mx-auto mb-3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
