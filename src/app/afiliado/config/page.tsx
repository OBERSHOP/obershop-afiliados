'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Influencer, useInfluencerStore } from '@/store/influencerStore';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Image from 'next/image';

// Importando as imagens diretamente
import avatar1 from '@/../public/assets/avatar-1.webp';
import avatar2 from '@/../public/assets/avatar-2.webp';
import avatar3 from '@/../public/assets/avatar-3.webp';
import avatar4 from '@/../public/assets/avatar-4.webp';
import avatar5 from '@/../public/assets/avatar-5.webp';
import avatar6 from '@/../public/assets/avatar-6.webp';
import avatar7 from '@/../public/assets/avatar-7.webp';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, Key, Upload, Save } from 'lucide-react';
import { api } from '@/lib/api';

// Schemas de validação
const personalDataSchema = z.object({
  fullName: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  cnpj: z.string().optional(),
  cep: z.string().min(8, 'CEP inválido'),
  state: z.string().min(2, 'Estado é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  streetAddress: z.string().min(3, 'Endereço é obrigatório'),
  numberAddress: z.string().min(1, 'Número é obrigatório'),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type PersonalDataFormValues = z.infer<typeof personalDataSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ConfigPage() {
  const { sessionId } = useAuthStore();
  const { influencer, setInfluencer, selectedAvatar, setSelectedAvatar } =
    useInfluencerStore();
  const [activeTab, setActiveTab] = useState('personal');

  const predefinedAvatars = [
    { src: avatar1, alt: 'Avatar 1' },
    { src: avatar2, alt: 'Avatar 2' },
    { src: avatar3, alt: 'Avatar 3' },
    { src: avatar4, alt: 'Avatar 4' },
    { src: avatar5, alt: 'Avatar 5' },
    { src: avatar6, alt: 'Avatar 6' },
    { src: avatar7, alt: 'Avatar 7' },
  ];

  // Formulário de dados pessoais
  const personalDataForm = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: influencer?.fullName || '',
      email: influencer?.email || '',
      phone: influencer?.phone || '',
      cpf: influencer?.cpf || '',
      cnpj: influencer?.cnpj || '',
      cep: influencer?.cep || '',
      state: influencer?.state || '',
      city: influencer?.city || '',
      neighborhood: influencer?.neighborhood || '',
      streetAddress: influencer?.streetAddress || '',
      numberAddress: influencer?.numberAddress || '',
    },
  });

  // Formulário de senha
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Query para buscar dados do influencer
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['influencer-data'],
    queryFn: async () => {
      const response = await api.get(`/influencer/${influencer?.id}`, {
        headers: { 'Session-Id': sessionId || '' },
      });

      // Atualizar o store e o formulário com os dados recebidos
      if (response.data) {
        setInfluencer(response.data);
        personalDataForm.reset({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          cpf: response.data.cpf || '',
          cnpj: response.data.cnpj || '',
          cep: response.data.cep || '',
          state: response.data.state || '',
          city: response.data.city || '',
          neighborhood: response.data.neighborhood || '',
          streetAddress: response.data.streetAddress || '',
          numberAddress: response.data.numberAddress || '',
        });
      }

      return response.data;
    },
    enabled: !!sessionId && !!influencer?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation para atualizar dados pessoais
  const updatePersonalDataMutation = useMutation({
    mutationFn: async (data: PersonalDataFormValues) => {
      const response = await api.put(
        `/influencer`,
        {
          influencerId: influencer?.id,
          ...data,
          cpf: data.cpf.replace(/\D/g, ''),
          phone: data.phone.replace(/\D/g, ''),
          cep: data.cep.replace(/\D/g, ''),
        },
        {
          headers: { 'Session-Id': sessionId || '' },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setInfluencer({ ...influencer, ...data });
      toast.success('Dados pessoais atualizados com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar dados pessoais. Tente novamente.');
    },
  });

  // Mutation para atualizar avatar
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await api.post(
        `/influencer/avatar`,
        {
          influencerId: influencer?.id,
          avatarUrl: avatarUrl,
        },
        {
          headers: { 'Session-Id': sessionId || '' },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setInfluencer({
        ...(influencer as Influencer),
        profilePicture: data.profilePicture,
      });
      toast.success('Avatar atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar avatar. Tente novamente.');
    },
  });

  // Mutation para atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const response = await api.post(
        `/auth/change-password`,
        {
          email: influencer?.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: { 'Session-Id': sessionId || '' },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso!');
      passwordForm.reset();
    },
    onError: () => {
      toast.error(
        'Erro ao atualizar senha. Verifique se a senha atual está correta.',
      );
    },
  });

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handlers
  const onPersonalDataSubmit = (data: PersonalDataFormValues) => {
    updatePersonalDataMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleAvatarSave = () => {
    if (selectedAvatar) {
      updateAvatarMutation.mutate(selectedAvatar);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 w-[90%]">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais, avatar e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Dados Pessoais</span>
                <span className="sm:hidden">Dados</span>
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Avatar</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>Senha</span>
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
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
                {/* Aba de Dados Pessoais */}
                <TabsContent value="personal">
                  <Form {...personalDataForm}>
                    <form
                      onSubmit={personalDataForm.handleSubmit(
                        onPersonalDataSubmit,
                      )}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={personalDataForm.control}
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
                          control={personalDataForm.control}
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
                          control={personalDataForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(00) 00000-0000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalDataForm.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalDataForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ (opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalDataForm.control}
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
                          control={personalDataForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="Estado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalDataForm.control}
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
                          control={personalDataForm.control}
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
                          control={personalDataForm.control}
                          name="streetAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Rua, Avenida, etc"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={personalDataForm.control}
                          name="numberAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="Número" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full sm:w-auto flex items-center gap-2"
                        disabled={updatePersonalDataMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        {updatePersonalDataMutation.isPending
                          ? 'Salvando...'
                          : 'Salvar Alterações'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Aba de Avatar */}
                <TabsContent value="avatar">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-32 w-32">
                        {selectedAvatar ? (
                          <div className="h-full w-full relative">
                            <Image
                              src={selectedAvatar}
                              alt={influencer?.fullName || 'Avatar'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : influencer?.profilePicture ? (
                          <AvatarImage
                            src={influencer.profilePicture}
                            alt={influencer.fullName || 'Avatar'}
                          />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {getInitials(influencer?.fullName || 'User Name')}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="text-center">
                        <p className="font-medium">{influencer?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {influencer?.email}
                        </p>
                      </div>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-3">
                          Selecione um avatar
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          {predefinedAvatars.map((avatar, index) => (
                            <div
                              key={index}
                              className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                                selectedAvatar === avatar.src.src
                                  ? 'border-primary ring-2 ring-primary/30'
                                  : 'border-transparent hover:border-muted-foreground/30'
                              }`}
                              onClick={() => handleAvatarSelect(avatar.src.src)}
                            >
                              <div className="h-16 w-16 relative">
                                <Image
                                  src={avatar.src}
                                  alt={avatar.alt}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleAvatarSave}
                        disabled={
                          !selectedAvatar || updateAvatarMutation.isPending
                        }
                        className="w-full flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updateAvatarMutation.isPending
                          ? 'Salvando...'
                          : 'Salvar Avatar'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba de Senha */}
                <TabsContent value="password">
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-6 max-w-md mx-auto"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha Atual</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite sua senha atual"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite a nova senha"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Nova Senha</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Confirme a nova senha"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full flex items-center gap-2"
                        disabled={updatePasswordMutation.isPending}
                      >
                        <Key className="h-4 w-4" />
                        {updatePasswordMutation.isPending
                          ? 'Alterando...'
                          : 'Alterar Senha'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
