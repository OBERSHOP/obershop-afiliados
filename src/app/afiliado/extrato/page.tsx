'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useInfluencerStore } from '@/store/influencerStore';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  BanknoteIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  InfoIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Definição de tipos
interface WithdrawalRequest {
  id: string;
  amount: number;
  requestDate: string;
  paymentDate: string | null;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankInfo: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    branch: string;
    holderName: string;
    document: string;
  };
  notes: string | null;
}

export default function ExtratoPage() {
  const { sessionId } = useAuthStore();
  const { influencer } = useInfluencerStore();
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parâmetros de paginação e filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('requestDate+desc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dados mockados para exemplo
  const mockWithdrawals: WithdrawalRequest[] = [
    {
      id: 'w1',
      amount: 1500.0,
      requestDate: '2023-05-10',
      paymentDate: '2023-05-15',
      status: 'completed',
      bankInfo: {
        bankName: 'Banco do Brasil',
        accountType: 'Corrente',
        accountNumber: '12345-6',
        branch: '1234',
        holderName: 'João Silva',
        document: '123.456.789-00',
      },
      notes: 'Pagamento processado com sucesso',
    },
    {
      id: 'w2',
      amount: 2300.5,
      requestDate: '2023-05-20',
      paymentDate: null,
      status: 'pending',
      bankInfo: {
        bankName: 'Nubank',
        accountType: 'Corrente',
        accountNumber: '98765-4',
        branch: '0001',
        holderName: 'João Silva',
        document: '123.456.789-00',
      },
      notes: null,
    },
    {
      id: 'w3',
      amount: 750.25,
      requestDate: '2023-04-25',
      paymentDate: '2023-05-02',
      status: 'completed',
      bankInfo: {
        bankName: 'Itaú',
        accountType: 'Poupança',
        accountNumber: '87654-3',
        branch: '4321',
        holderName: 'João Silva',
        document: '123.456.789-00',
      },
      notes: 'Pagamento processado com sucesso',
    },
    {
      id: 'w4',
      amount: 1200.0,
      requestDate: '2023-05-25',
      paymentDate: null,
      status: 'processing',
      bankInfo: {
        bankName: 'Bradesco',
        accountType: 'Corrente',
        accountNumber: '54321-0',
        branch: '0123',
        holderName: 'João Silva',
        document: '123.456.789-00',
      },
      notes: 'Em processamento pelo financeiro',
    },
    {
      id: 'w5',
      amount: 500.0,
      requestDate: '2023-04-15',
      paymentDate: null,
      status: 'rejected',
      bankInfo: {
        bankName: 'Santander',
        accountType: 'Corrente',
        accountNumber: '65432-1',
        branch: '3210',
        holderName: 'João Silva',
        document: '123.456.789-00',
      },
      notes: 'Dados bancários incorretos',
    },
  ];

  // Simulação de chamada à API
  const {
    data: withdrawals = mockWithdrawals,
    isLoading,
    isError,
    refetch,
  } = useQuery<WithdrawalRequest[]>({
    queryKey: ['withdrawals', influencer?.id],
    queryFn: async () => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.get("/withdrawals", {
      //   params: { influencerId: influencer?.id },
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;

      // Retornando dados mockados
      return mockWithdrawals;
    },
    enabled: !!sessionId && !!influencer?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Cálculos de resumo
  const summary = useMemo(() => {
    const totalGanho = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const saquesEfetuados = withdrawals
      .filter((w) => w.status === 'completed')
      .reduce((acc, w) => acc + w.amount, 0);
    const emAnalise = withdrawals
      .filter((w) => w.status === 'pending' || w.status === 'processing')
      .reduce((acc, w) => acc + w.amount, 0);

    return { totalGanho, saquesEfetuados, emAnalise };
  }, [withdrawals]);

  // Filtragem e paginação
  const { paginatedWithdrawals, totalPages } = useMemo(() => {
    // Filtragem por status
    const filtered =
      statusFilter === 'all'
        ? withdrawals
        : withdrawals.filter((w) => w.status === statusFilter);

    // Ordenação
    const [field, direction] = orderBy.split('+');
    const sorted = [...filtered].sort((a, b) => {
      if (field === 'requestDate') {
        return direction === 'asc'
          ? new Date(a.requestDate).getTime() -
              new Date(b.requestDate).getTime()
          : new Date(b.requestDate).getTime() -
              new Date(a.requestDate).getTime();
      }
      if (field === 'amount') {
        return direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

    // Paginação
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedWithdrawals = sorted.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    return { paginatedWithdrawals, totalItems, totalPages };
  }, [withdrawals, orderBy, currentPage, itemsPerPage, statusFilter]);

  const handleRowClick = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.log(error)
      return 'Data inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Em processamento
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Concluído
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <InfoIcon className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle2Icon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  // Função para navegar entre páginas
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Extrato de Saques
          </h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas solicitações de saque
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total já ganho</p>
            <p className="text-2xl font-bold">
              R$ {summary.totalGanho.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Saques efetuados</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.saquesEfetuados.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Em análise</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {summary.emAnalise.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>
            Todas as solicitações de saque realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="processing">Em processamento</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderBy} onValueChange={setOrderBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestDate+desc">
                    Data (mais recente)
                  </SelectItem>
                  <SelectItem value="requestDate+asc">
                    Data (mais antiga)
                  </SelectItem>
                  <SelectItem value="amount+desc">Valor (maior)</SelectItem>
                  <SelectItem value="amount+asc">Valor (menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10 itens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 itens</SelectItem>
                  <SelectItem value="10">10 itens</SelectItem>
                  <SelectItem value="20">20 itens</SelectItem>
                  <SelectItem value="50">50 itens</SelectItem>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Data Solicitação</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWithdrawals.length > 0 ? (
                      paginatedWithdrawals.map((withdrawal) => (
                        <TableRow
                          key={withdrawal.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(withdrawal)}
                        >
                          <TableCell className="font-medium">
                            #{withdrawal.id}
                          </TableCell>
                          <TableCell>
                            {formatDate(withdrawal.requestDate)}
                          </TableCell>
                          <TableCell>
                            R$ {withdrawal.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {formatDate(withdrawal.paymentDate)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(withdrawal.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhuma solicitação de saque encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Cards para mobile */}
              <div className="grid gap-4 md:hidden">
                {paginatedWithdrawals.length > 0 ? (
                  paginatedWithdrawals.map((withdrawal) => (
                    <Card
                      key={withdrawal.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(withdrawal)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">
                            Solicitação #{withdrawal.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(withdrawal.requestDate)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">
                            R$ {withdrawal.amount.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(withdrawal.status)}
                            {getStatusBadge(withdrawal.status)}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <p>Banco: {withdrawal.bankInfo.bankName}</p>
                          <p>Pagamento: {formatDate(withdrawal.paymentDate)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      Nenhuma solicitação de saque encontrada.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do saque */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BanknoteIcon className="h-5 w-5" />
              Detalhes do Saque
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a solicitação de saque
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    ID da Solicitação
                  </p>
                  <p className="font-medium">#{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data da Solicitação
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedWithdrawal.requestDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    R$ {selectedWithdrawal.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data do Pagamento
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedWithdrawal.paymentDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedWithdrawal.status)}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Dados Bancários</p>
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Banco</p>
                      <p>{selectedWithdrawal.bankInfo.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tipo de Conta
                      </p>
                      <p>{selectedWithdrawal.bankInfo.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Agência</p>
                      <p>{selectedWithdrawal.bankInfo.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conta</p>
                      <p>{selectedWithdrawal.bankInfo.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Titular</p>
                      <p>{selectedWithdrawal.bankInfo.holderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Documento</p>
                      <p>{selectedWithdrawal.bankInfo.document}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedWithdrawal.notes && (
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Observações</p>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p>{selectedWithdrawal.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
