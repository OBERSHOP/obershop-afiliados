'use client';

import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Plus, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// Definição de tipos
interface Influencer {
  id: string;
  fullName: string;
  email: string;
  codeCoupon: string;
  phone: string;
  entryDate: string;
  leader: string | null;
  leaderName: string | null;
  manager: string | null;
  active: boolean;
  cpf: string;
  cnpj: string | null;
  cep: string;
  state: string;
  city: string | null;
  neighborhood: string | null;
  streetAddress: string;
  numberAddress: string;
}

interface InfluencerResponse {
  content: Influencer[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Schemas de validação
const inviteSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  cnpj: z.string().optional(),
});

const addInfluencerSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  cnpj: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  codeCoupon: z.string().min(3, 'Código do cupom é obrigatório'),
  cep: z.string().min(8, 'CEP inválido'),
  state: z.string().min(2, 'Estado é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  streetAddress: z.string().min(3, 'Endereço é obrigatório'),
  numberAddress: z.string().min(1, 'Número é obrigatório'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;
type AddInfluencerFormValues = z.infer<typeof addInfluencerSchema>;

export default function EquipePage() {
  const { canViewTeam, canEditTeam, canCreateTeam } = usePermission();
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy] = useState('name');
  const { sessionId } = useAuthStore();

  // Parâmetros de paginação
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('name+asc');

  const {
    data: influencerResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<InfluencerResponse>({
    queryKey: [
      'influencers',
      pageIndex,
      itemsPerPage,
      orderBy,
      searchTerm,
      searchBy,
    ],
    queryFn: async () => {
      const response = await api.get('/influencer/paged', {
        headers: {
          'Session-Id': sessionId || '',
        },
        params: {
          pageIndex,
          itemsPerPage,
          orderBy,
          search: searchTerm || undefined,
          searchBy: [searchBy],
        },
      });
      return response.data;
    },
    enabled: !!sessionId && canViewTeam,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Formulário de convite
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      cnpj: '',
    },
  });

  // Formulário de adicionar influencer
  const addInfluencerForm = useForm<AddInfluencerFormValues>({
    resolver: zodResolver(addInfluencerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      cpf: '',
      cnpj: '',
      phone: '',
      codeCoupon: '',
      cep: '',
      state: '',
      city: '',
      neighborhood: '',
      streetAddress: '',
      numberAddress: '',
    },
  });

  // Mutação para enviar convite
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const response = await api.post('/influencer/pre-register', data, {
        headers: {
          'Session-Id': sessionId || '',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Convite enviado com sucesso!');
      setIsInviteModalOpen(false);
      inviteForm.reset();
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro ao enviar convite. Tente novamente.');
    },
  });

  // Mutação para adicionar influencer
  const addInfluencerMutation = useMutation({
    mutationFn: async (data: AddInfluencerFormValues) => {
      const response = await api.post('/influencer', data, {
        headers: {
          'Session-Id': sessionId || '',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Influencer adicionado com sucesso!');
      setIsAddModalOpen(false);
      addInfluencerForm.reset();
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao adicionar influencer:', error);
      toast.error('Erro ao adicionar influencer. Tente novamente.');
    },
  });

  // Funções de submit
  const onInviteSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate(data);
  };

  const onAddInfluencerSubmit = (data: AddInfluencerFormValues) => {
    addInfluencerMutation.mutate(data);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1); // Volta para a primeira página ao pesquisar
    refetch();
  };

  const handleNextPage = () => {
    if (pageIndex < (influencerResponse?.totalPages || 1)) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setPageIndex(1); // Volta para a primeira página ao mudar itens por página
  };

  const handleOrderByChange = (value: string) => {
    setOrderBy(value);
    setPageIndex(1); // Volta para a primeira página ao mudar ordenação
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.log(error);
      return 'Data inválida';
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    );
  };

  const handleRowClick = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setIsModalOpen(true);
  };

  // Dados para exibição
  const influencers = influencerResponse?.content || [];
  const totalPages = influencerResponse?.totalPages || 1;
  const currentPage = influencerResponse?.number || 0;
  const totalElements = influencerResponse?.totalElements || 0;

  if (!canViewTeam) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para visualizar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 w-[95%] mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Equipe de Influenciadores</CardTitle>
            <CardDescription>
              Gerencie todos os influenciadores da sua equipe.
            </CardDescription>
          </div>
          {canCreateTeam && (
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Convite
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Influencer
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de pesquisa e filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={orderBy} onValueChange={handleOrderByChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name+asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name+desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="entryDate+desc">
                    Data de entrada (recente)
                  </SelectItem>
                  <SelectItem value="entryDate+asc">
                    Data de entrada (antiga)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Buscar</Button>
            </form>

            <div className="flex gap-2">
              <div>
                <Select value={orderBy} onValueChange={handleOrderByChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name+asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="name+desc">Nome (Z-A)</SelectItem>
                    <SelectItem value="entryDate+desc">
                      Data de entrada (recente)
                    </SelectItem>
                    <SelectItem value="entryDate+asc">
                      Data de entrada (antiga)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Itens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {influencers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Nenhum influenciador encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      influencers.map((influencer) => (
                        <TableRow
                          key={influencer.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            canEditTeam && handleRowClick(influencer)
                          }
                        >
                          <TableCell className="font-medium">
                            {influencer.fullName}
                          </TableCell>
                          <TableCell>{influencer.email}</TableCell>
                          <TableCell>{influencer.codeCoupon}</TableCell>
                          <TableCell>
                            {getStatusBadge(influencer.active)}
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
                    Nenhum influenciador encontrado.
                  </div>
                ) : (
                  influencers.map((influencer) => (
                    <Card
                      key={influencer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => canEditTeam && handleRowClick(influencer)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{influencer.fullName}</p>
                        </div>
                        <div>{getStatusBadge(influencer.active)}</div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Paginação */}
              {influencers.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {currentPage * itemsPerPage + 1} a{' '}
                    {Math.min((currentPage + 1) * itemsPerPage, totalElements)}{' '}
                    de {totalElements} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pageIndex === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Página anterior</span>
                    </Button>
                    <div className="text-sm">
                      Página {currentPage + 1} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={pageIndex >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Próxima página</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Influenciador</DialogTitle>
            <DialogDescription>
              Informações completas sobre o influenciador selecionado.
            </DialogDescription>
          </DialogHeader>

          {selectedInfluencer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedInfluencer.fullName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedInfluencer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cupom</p>
                  <p className="font-medium">{selectedInfluencer.codeCoupon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">
                    {selectedInfluencer.phone || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{selectedInfluencer.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">
                    {selectedInfluencer.cnpj || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Entrada
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedInfluencer.entryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedInfluencer.active)}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Líder</p>
                  <p className="font-medium">
                    {selectedInfluencer.leaderName || 'Não possui'}
                  </p>
                </div>

                <div className="col-span-2 pt-2">
                  <p className="text-sm font-medium mb-2">Endereço</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">CEP</p>
                      <p className="text-sm">{selectedInfluencer.cep}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <p className="text-sm">{selectedInfluencer.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cidade</p>
                      <p className="text-sm">
                        {selectedInfluencer.city || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bairro</p>
                      <p className="text-sm">
                        {selectedInfluencer.neighborhood || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rua</p>
                      <p className="text-sm">
                        {selectedInfluencer.streetAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p className="text-sm">
                        {selectedInfluencer.numberAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Enviar Convite */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Convite</DialogTitle>
            <DialogDescription>
              Preencha os dados para enviar um convite para um novo
              influenciador.
            </DialogDescription>
          </DialogHeader>

          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
              className="space-y-4"
            >
              <FormField
                control={inviteForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@exemplo.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Influencer */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Influencer</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo influenciador.
            </DialogDescription>
          </DialogHeader>

          <Form {...addInfluencerForm}>
            <form
              onSubmit={addInfluencerForm.handleSubmit(onAddInfluencerSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addInfluencerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@exemplo.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="codeCoupon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Cupom</FormLabel>
                      <FormControl>
                        <Input placeholder="CUPOM123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addInfluencerForm.control}
                  name="numberAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={addInfluencerMutation.isPending}
                >
                  {addInfluencerMutation.isPending
                    ? 'Adicionando...'
                    : 'Adicionar Influencer'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
