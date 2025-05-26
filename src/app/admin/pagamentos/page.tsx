'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// Tipos
type PaymentStatus = 'Pendente' | 'Aprovado' | 'Reprovado';

interface StatusChange {
  id: string;
  paymentId: string;
  changedBy: string;
  previousStatus: PaymentStatus;
  newStatus: PaymentStatus;
  timestamp: string;
}

interface PaymentRequest {
  id: string;
  name: string;
  value: number;
  status: PaymentStatus;
  date: string;
  time: string;
  couponCode: string;
  isActive: boolean;
  pdfUrl?: string; // Novo campo para URL do PDF
  statusHistory: StatusChange[];
}

export default function PagamentoPage() {
  const { canEditPayment } = usePermission();
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  // Dados mockados
  const [payments, setPayments] = useState<PaymentRequest[]>([
    {
      id: '1',
      name: 'João Silva',
      value: 1250.75,
      status: 'Pendente',
      date: '15/05/2023',
      time: '14:30',
      couponCode: 'JOAO10',
      isActive: true,
      pdfUrl: 'https://example.com/comprovantes/joao-silva.pdf',
      statusHistory: [],
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      value: 2340.5,
      status: 'Pendente',
      date: '16/05/2023',
      time: '09:45',
      couponCode: 'MARIA20',
      isActive: true,
      pdfUrl: 'https://example.com/comprovantes/maria-oliveira.pdf',
      statusHistory: [],
    },
    {
      id: '3',
      name: 'Carlos Santos',
      value: 980.25,
      status: 'Pendente',
      date: '16/05/2023',
      time: '11:20',
      couponCode: 'CARLOS15',
      isActive: false,
      statusHistory: [],
    },
    {
      id: '4',
      name: 'Ana Pereira',
      value: 1750.0,
      status: 'Pendente',
      date: '17/05/2023',
      time: '16:15',
      couponCode: 'ANA25',
      isActive: true,
      statusHistory: [],
    },
    {
      id: '5',
      name: 'Lucas Mendes',
      value: 3200.8,
      status: 'Pendente',
      date: '18/05/2023',
      time: '10:30',
      couponCode: 'LUCAS30',
      isActive: true,
      statusHistory: [],
    },
  ]);

  const handleRowClick = (payment: PaymentRequest) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const updatePaymentStatus = (paymentId: string, newStatus: PaymentStatus) => {
    if (!user?.fullName) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setPayments(
      payments.map((payment) => {
        if (payment.id === paymentId) {
          const statusChange: StatusChange = {
            id: crypto.randomUUID(),
            paymentId,
            changedBy: user.fullName,
            previousStatus: payment.status,
            newStatus,
            timestamp: `${formattedDate} às ${formattedTime}`,
          };

          return {
            ...payment,
            status: newStatus,
            statusHistory: [...payment.statusHistory, statusChange],
          };
        }
        return payment;
      }),
    );
  };

  const handleApprove = () => {
    if (!selectedPayment) return;

    // Aqui seria a chamada para a API
    // await Api.put(`/payments/${selectedPayment.id}`, { status: 'Aprovado' });

    updatePaymentStatus(selectedPayment.id, 'Aprovado');

    toast.success(
      `O pagamento de ${selectedPayment.name} foi aprovado com sucesso.`,
    );
  };

  const handleReject = () => {
    if (!selectedPayment) return;

    // Aqui seria a chamada para a API
    // await Api.put(`/payments/${selectedPayment.id}`, { status: 'Reprovado' });

    // Atualiza o estado local
    updatePaymentStatus(selectedPayment.id, 'Reprovado');

    toast.error(`O pagamento de ${selectedPayment.name} foi reprovado.`);
  };

  const handlePending = () => {
    if (!selectedPayment) return;

    // Aqui seria a chamada para a API
    // await Api.put(`/payments/${selectedPayment.id}`, { status: 'Pendente' });

    // Atualiza o estado local
    updatePaymentStatus(selectedPayment.id, 'Pendente');

    toast.info(
      `O pagamento de ${selectedPayment.name} foi marcado como pendente.`,
    );
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'Reprovado':
        return <Badge className="bg-red-500">Reprovado</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };

  // Atualiza o selectedPayment quando o payments mudar
  useEffect(() => {
    if (selectedPayment) {
      const updatedPayment = payments.find((p) => p.id === selectedPayment.id);
      if (updatedPayment) {
        setSelectedPayment(updatedPayment);
      }
    }
  }, [payments, selectedPayment]);

  // Adicionando a função para abrir o PDF
  const handleOpenPdf = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Nenhum comprovante disponível');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Pagamento</CardTitle>
          <CardDescription>
            Lista de todas as solicitações de pagamento pendentes e processadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabela para desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => canEditPayment && handleRowClick(payment)}
                  >
                    <TableCell className="font-medium">
                      {payment.name}
                    </TableCell>
                    <TableCell>R$ {payment.value.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Cards para mobile */}
          <div className="grid gap-4 md:hidden">
            {payments.map((payment) => (
              <Card
                key={payment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => canEditPayment && handleRowClick(payment)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      R$ {payment.value.toFixed(2)}
                    </p>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a solicitação de pagamento.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedPayment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    R$ {selectedPayment.value.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {selectedPayment.date} às {selectedPayment.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cupom</p>
                  <p className="font-medium">{selectedPayment.couponCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Status do Influencer
                  </p>
                  <Badge
                    className={
                      selectedPayment.isActive ? 'bg-green-500' : 'bg-red-500'
                    }
                  >
                    {selectedPayment.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                {/* Novo campo para o comprovante em PDF */}
                <div className="col-span-2 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Comprovante</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleOpenPdf(selectedPayment.pdfUrl)}
                    disabled={!selectedPayment.pdfUrl}
                  >
                    <FileText className="h-4 w-4" />
                    {selectedPayment.pdfUrl ? 'Visualizar Comprovante' : 'Sem comprovante'}
                  </Button>
                </div>
              </div>

              {canEditPayment && (
                <DialogFooter className="flex sm:justify-between gap-4 mt-6">
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={handleReject}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reprovar
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handlePending}
                  >
                    Pendente
                  </Button>

                  <Button
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                </DialogFooter>
              )}

              {/* Histórico de alterações */}
              {/* {selectedPayment.statusHistory.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-2">Histórico de alterações</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedPayment.statusHistory.map((change) => (
                      <div
                        key={change.id}
                        className="text-sm p-2 bg-muted rounded-md"
                      >
                        <p>
                          <span className="font-medium">
                            {change.changedBy}
                          </span>{' '}
                          alterou o status de{' '}
                          <Badge variant="outline" className="font-normal">
                            {change.previousStatus}
                          </Badge>{' '}
                          para{' '}
                          <Badge
                            className={
                              change.newStatus === 'Aprovado'
                                ? 'bg-green-500'
                                : change.newStatus === 'Reprovado'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }
                          >
                            {change.newStatus}
                          </Badge>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {change.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
