'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Api } from '@/lib/apiHandler';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const recoverSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type RecoverSchema = z.infer<typeof recoverSchema>;

export function RecoverLoginForm() {
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverSchema>({
    resolver: zodResolver(recoverSchema),
  });

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const onSubmit = async (data: RecoverSchema) => {
    if (cooldown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await Api.post('/auth/forget-password', data);
      toast.success(
        'Se o e-mail estiver cadastrado, enviaremos o link para recuperação.',
      );
      setCooldown(30);
    } catch {
      toast.error('Erro ao tentar recuperar a senha.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="relative flex items-center">
          <Input
            placeholder="Digite seu e-mail"
            className="bg-background py-5 w-full"
            {...register('email')}
          />
          <Mail
            size={18}
            className="absolute top-1/2 right-4 -translate-y-1/2"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={cooldown > 0 || isSubmitting}
        className="w-full cursor-pointer bg-terciary hover:bg-terciary-foreground disabled:opacity-60"
      >
        {cooldown > 0
          ? `Aguarde ${cooldown}s para enviar novamente`
          : isSubmitting
          ? 'Enviando...'
          : 'Enviar link de recuperação'}
      </Button>

      <Link href="/login">
        <p className="text-sm text-center text-muted-foreground mt-4 hover:underline">
          Voltar para o login
        </p>
      </Link>
    </form>
  );
}
