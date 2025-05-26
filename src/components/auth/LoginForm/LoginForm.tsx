'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '@/schema/authSchema';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { validateSessionId } from '@/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export function LoginForm() {
  const { loginMutation } = useAuth();
  const { setSessionId, setUser, clearSession } = useAuthStore.getState();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    setLoading(true);

    loginMutation.mutate(data, {
      onError: () => {
        setLoading(false);
        toast.error('E-mail ou senha inválidos');
      },
      onSuccess: async (data) => {
        try {
          const user = await validateSessionId(data.sessionId);
          
          // Armazenar dados do usuário e sessionId
          setSessionId(data.sessionId);
          setUser(user);

          // Verificar se o usuário tem um papel válido antes de redirecionar
          if (!user || !user.role) {
            throw new Error('Dados de usuário inválidos');
          }

          // Redirecionar com base no papel do usuário
          const path = user.role === 'ADMIN' ? '/admin/home' : '/afiliado/home';
          console.log('Redirecionando para:', path, 'Papel:', user.role);
          
          // Usar setTimeout para garantir que o estado seja atualizado antes do redirecionamento
          setTimeout(() => {
            router.push(path);
            setLoading(false);
          }, 100);
        } catch (err: unknown) {
          console.error('Erro na validação da sessão:', err);
          toast.error('Erro ao validar sessão');
          clearSession();
          router.push('/login');
          setLoading(false);
        }
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full relative z-10 flex items-center justify-center flex-col max-w-[350px] mx-auto"
    >
      <div className="w-full">
        <label htmlFor="email" className="text-md text-muted-foreground">
          E-mail
        </label>
        <div className="flex items-center justify-center">
          <Input
            placeholder="Digite seu e-mail"
            className="bg-background py-5 w-full"
            {...register('email')}
            onChange={(e) => {
              const value = e.target.value.replace(/['"%;<>!?]/g, '');
              e.target.value = value;
            }}
          />
        </div>
      </div>

      <div className="w-full">
        <label htmlFor="password" className="text-md text-muted-foreground">
          Senha
        </label>
        <div className="relative flex items-center justify-center">
          <Input
            placeholder="Digite sua senha"
            type={showPassword ? 'text' : 'password'}
            className="bg-background py-5 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer bg-terciary hover:bg-terciary-foreground"
        disabled={loginMutation.isPending || loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Link href="/esqueceu-a-senha">
        <p className="text-sm text-center text-muted-foreground mt-4">
          Esqueceu sua senha?{' '}
          <span className="text-terciary hover:text-terciary-foreground">
            Clique aqui
          </span>
        </p>
      </Link>
    </form>
  );
}
