'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useBalance } from '@/hooks/useBalance';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiClient } from '@/lib/apiHandler';
import { maskCurrency } from '@/lib/masks';

// Schema com validações
const withdrawFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Valor obrigatório')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
      },
      { message: 'Valor inválido' },
    )
    .refine((val) => parseFloat(val.replace(',', '.')) >= 50, {
      message: 'Valor mínimo para saque é R$ 50,00',
    }),
  file: z
    .custom<File>()
    .refine((file) => file instanceof File && file.type === 'application/pdf', {
      message: 'Envie um arquivo PDF válido',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'O arquivo deve ter no máximo 5MB',
    }),
});

type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

export default function PagamentosPage() {
  const { sessionId } = useAuthStore();
  const [showBalance, setShowBalance] = useState(true);

  const {
    data: balance,
    isLoading: loadingBalance,
    isError: errorBalance,
    refetch: refetchBalance,
  } = useBalance(!!sessionId);

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: '',
      file: undefined,
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawFormValues) => {
      const amount = parseFloat(data.amount.replace(',', '.'));
      const formData = new FormData();

      formData.append('value', amount.toString());
      formData.append('file', data.file);

      const res = await apiClient.post('/payment/request', formData, {
        headers: {
          'Session-Id': sessionId || '',
        },
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success('Solicitação de saque enviada com sucesso!');
      form.reset();
      refetchBalance();
    },
    onError: () => {
      toast.error('Erro ao solicitar saque. Tente novamente.');
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return showBalance
      ? `R$ ${value.toFixed(2).replace('.', ',')}`
      : 'R$ *****';
  };

  const onSubmit = (values: WithdrawFormValues) => {
    const amount = parseFloat(values.amount.replace(',', '.'));

    if (balance && amount > balance.balanceAvailable) {
      toast.error('Valor solicitado maior que o saldo disponível');
      return;
    }

    withdrawMutation.mutate(values);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Solicitar Saque
          </CardTitle>
          <CardDescription>
            Solicite o saque do seu saldo disponível para sua conta bancária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Seu Saldo</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                  title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                  {showBalance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBalance ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : errorBalance ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>
                    Não foi possível carregar seu saldo. Tente novamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Disponível para saque
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(balance?.balanceAvailable)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">A liberar</p>
                      <p className="font-medium">
                        {formatCurrency(balance?.balanceToRelease)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Disponível a partir do dia 10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bloqueado</p>
                      <p className="font-medium">
                        {formatCurrency(balance?.balanceBlocked)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saldo do mês atual
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Saque</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          {...field}
                          className="pl-8 text-white!"
                          placeholder="0,00"
                          inputMode="numeric"
                          onChange={(e) => {
                            const masked = maskCurrency(e.target.value);
                            const raw = parseFloat(
                              masked.replace(/\./g, '').replace(',', '.'),
                            );

                            if (
                              !balance ||
                              raw <= (balance.balanceAvailable || 0)
                            ) {
                              field.onChange(masked);
                            }
                          }}
                          disabled={
                            withdrawMutation.isPending ||
                            !balance ||
                            (balance?.balanceAvailable || 0) <= 0
                          }
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Informe o valor que deseja sacar. O valor mínimo é de R$
                      50,00.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ref } }) => (
                  <FormItem>
                    <FormLabel>Nota Fiscal (PDF)</FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        ref={ref}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormDescription>
                      Envie o PDF necessário para processar o pagamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  O saque será processado em até 5 dias e depositado na conta
                  bancária cadastrada no seu perfil.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  withdrawMutation.isPending ||
                  !balance ||
                  (balance?.balanceAvailable || 0) <= 0 ||
                  loadingBalance
                }
              >
                {withdrawMutation.isPending
                  ? 'Processando...'
                  : 'Solicitar Saque'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
          <p>Dúvidas sobre pagamentos? Entre em contato com nosso suporte.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
