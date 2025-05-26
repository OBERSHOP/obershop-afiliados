'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useInfluencerStore } from '@/store/influencerStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Send,
  User,
  UserPlus,
  ChevronUp,
  Phone,
  Tag,
} from 'lucide-react';

// Definição de tipos
interface Influencer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  codeCoupon: string;
  active: boolean;
  entryDate: string;
  leaderId: string | null;
  leaderName: string | null;
}

interface TeamMember extends Influencer {
  totalSales: number;
  totalCommission: number;
}

interface TeamData {
  leader: TeamMember | null;
  currentUser: TeamMember;
  members: TeamMember[];
}

// Schema de validação para o convite
const inviteSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  cnpj: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function EquipePage() {
  const { sessionId } = useAuthStore();
  const { influencer } = useInfluencerStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  // Simulação de chamada à API para obter dados da equipe
  const {
    data: teamData,
    isLoading,
    isError,
    refetch,
  } = useQuery<TeamData>({
    queryKey: ['team-data', influencer?.id],
    queryFn: async () => {
      // Em produção, substituir por chamada real à API
      // const response = await Api.get("/team", {
      //   params: { influencerId: influencer?.id },
      //   headers: { "Session-Id": sessionId || "" },
      // });
      // return response.data;

      // Dados mockados para exemplo
      return {
        leader: influencer?.leader
          ? {
              id: 'leader123',
              fullName: 'João Silva',
              email: 'joao.silva@exemplo.com',
              phone: '(11) 98765-4321',
              codeCoupon: 'JOAO10',
              active: true,
              entryDate: '2022-01-15',
              leaderId: null,
              leaderName: null,
              totalSales: 45,
              totalCommission: 4500.0,
            }
          : null,
        currentUser: {
          id: influencer?.id || 'user123',
          fullName: influencer?.fullName || 'Maria Souza',
          email: influencer?.email || 'maria.souza@exemplo.com',
          phone: influencer?.phone || '(11) 91234-5678',
          codeCoupon: influencer?.codeCoupon || 'MARIA15',
          active: true,
          entryDate: '2023-03-10',
          leaderId: influencer?.leaderId || 'leader123',
          leaderName: influencer?.leaderName || 'João Silva',
          totalSales: 23,
          totalCommission: 2100.5,
        },
        members: [
          {
            id: 'member1',
            fullName: 'Pedro Oliveira',
            email: 'pedro.oliveira@exemplo.com',
            phone: '(11) 98888-7777',
            codeCoupon: 'PEDRO20',
            active: true,
            entryDate: '2023-05-20',
            leaderId: influencer?.id || 'user123',
            leaderName: influencer?.fullName || 'Maria Souza',
            totalSales: 12,
            totalCommission: 980.75,
          },
          {
            id: 'member2',
            fullName: 'Ana Santos',
            email: 'ana.santos@exemplo.com',
            phone: '(11) 97777-6666',
            codeCoupon: 'ANA25',
            active: true,
            entryDate: '2023-06-15',
            leaderId: influencer?.id || 'user123',
            leaderName: influencer?.fullName || 'Maria Souza',
            totalSales: 8,
            totalCommission: 650.3,
          },
          {
            id: 'member3',
            fullName: 'Carlos Ferreira',
            email: 'carlos.ferreira@exemplo.com',
            phone: '(11) 96666-5555',
            codeCoupon: 'CARLOS30',
            active: false,
            entryDate: '2023-07-10',
            leaderId: influencer?.id || 'user123',
            leaderName: influencer?.fullName || 'Maria Souza',
            totalSales: 0,
            totalCommission: 0,
          },
        ],
      };
    },
    enabled: !!sessionId && !!influencer?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutação para enviar convite
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const payload = {
        ...data,
        leader: sessionId,
      };

      const response = await Api.post('/influencer/pre-register', payload, {
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

  // Função de submit do convite
  const onInviteSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
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
      <Badge variant="outline" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800">
        Inativo
      </Badge>
    );
  };

  // Componente de card de membro
  const MemberCard = ({
    member,
    isLeader = false,
    isCurrentUser = false,
  }: {
    member: TeamMember;
    isLeader?: boolean;
    isCurrentUser?: boolean;
  }) => {
    return (
      <Card
        className={`${
          isCurrentUser ? 'border-primary' : isLeader ? 'border-primary/30' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-muted rounded-full p-2">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {member.fullName}
                  {isCurrentUser && (
                    <span className="text-xs ml-2 text-primary">(Você)</span>
                  )}
                  {isLeader && (
                    <span className="text-xs ml-2 text-primary/70">
                      (Líder)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{member.email}</CardDescription>
              </div>
            </div>
            {getStatusBadge(member.active)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Telefone
              </p>
              <p className="font-medium">{member.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Cupom
              </p>
              <p className="font-medium">{member.codeCoupon}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendas</p>
              <p className="font-medium">{member.totalSales}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comissão</p>
              <p className="font-medium text-green-600">
                R$ {member.totalCommission.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          Membro desde {formatDate(member.entryDate)}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[95%]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Minha Equipe
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de afiliados e acompanhe seu desempenho
          </p>
        </div>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Enviar Convite
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
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
        <div className="space-y-8">
          {/* Seção do Líder */}
          {teamData?.leader && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ChevronUp className="h-4 w-4" />
                <h2 className="text-sm font-medium">Meu Líder</h2>
              </div>
              <MemberCard member={teamData.leader} isLeader={true} />
            </div>
          )}

          {/* Seção do Usuário Atual */}
          {teamData?.currentUser && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <h2 className="text-sm font-medium">Meu Perfil</h2>
              </div>
              <MemberCard member={teamData.currentUser} isCurrentUser={true} />
            </div>
          )}

          {/* Seção dos Membros da Equipe */}
          {teamData?.members && teamData.members.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <h2 className="text-sm font-medium">
                  Minha Equipe ({teamData.members.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamData.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Mensagem quando não há membros na equipe */}
          {(!teamData?.members || teamData.members.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Sua equipe está vazia
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não possui membros em sua equipe. Convide pessoas
                  para começar a construir sua rede.
                </p>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Enviar Convite
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal de Enviar Convite */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Convite
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para enviar um convite para um novo afiliado.
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
    </div>
  );
}
