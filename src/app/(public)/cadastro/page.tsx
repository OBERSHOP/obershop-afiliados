'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import logoImg from '@/../public/favicon.ico';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';
import { apiClient } from '@/lib/apiHandler';
import { useDebounce } from 'use-debounce';
import { Skeleton } from '@/components/ui/skeleton';

// Máscaras para os inputs
const cpfMask = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const cnpjMask = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
const phoneMask = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
const cepMask = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{3})/, '$1-$2');

// Função para sanitizar inputs contra SQL injection
const sanitizeInput = (value: string): string => {
  // Remover caracteres potencialmente perigosos
  return value.replace(/['";=<>]/g, '');
};

// Schemas de validação para cada etapa
const stepSchemas = [
  z.object({
    email: z.string().email('E-mail inválido').min(1, 'E-mail obrigatório'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha obrigatória'),
  }),
  z.object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    cnpj: z.string().optional(),
    phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
    codeCoupon: z.string().min(1, 'Código do Cupom obrigatório'),
  }),
  z.object({
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    state: z.string().min(2, 'Estado obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    streetAddress: z.string().min(2, 'Rua obrigatória'),
    numberAddress: z.string().min(1, 'Número obrigatório'),
  }),
] as const;

// Schema completo para o formulário
const cadastroSchema = z
  .object({
    email: z
      .string()
      .min(1, 'E-mail é obrigatório')
      .email('Formato de e-mail inválido')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    password: z
      .string()
      .min(8, 'A senha precisa conter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha precisa conter no mínimo 1 letra maiúscula')
      .regex(/\d/, 'A senha precisa conter no mínimo 1 número')
      .regex(
        /[^a-zA-Z0-9]/,
        'A senha precisa conter no mínimo 1 caractere especial',
      )
      .refine((val) => !/['";]/.test(val), 'Caracteres inválidos detectados'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    codeCoupon: z
      .string()
      .min(1, 'Código do Cupom obrigatório')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    fullName: z
      .string()
      .min(3, 'Nome completo obrigatório')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    cnpj: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val),
        'CNPJ inválido',
      ),
    phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    state: z
      .string()
      .min(2, 'Estado obrigatório')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    city: z
      .string()
      .min(2, 'Cidade obrigatória')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    neighborhood: z
      .string()
      .min(2, 'Bairro obrigatório')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    streetAddress: z
      .string()
      .min(2, 'Rua obrigatória')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
    numberAddress: z
      .string()
      .min(1, 'Número obrigatório')
      .refine(
        (val) => !/['";=<>]/.test(val),
        'Caracteres inválidos detectados',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type CadastroForm = z.infer<typeof cadastroSchema>;

// Interface para a resposta da API de CEP do Brasil API
interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export default function Cadastro() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepComplete, setStepComplete] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const steps = [1, 2, 3];
  
  // Extrair apenas o sessionId da URL
  const sessionId = searchParams.get('sessionId');
  
  // Inicializar o formulário com react-hook-form e zod
  const form = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      codeCoupon: '',
      fullName: '',
      cpf: '',
      cnpj: '',
      phone: '',
      cep: '',
      state: '',
      city: '',
      neighborhood: '',
      streetAddress: '',
      numberAddress: '',
    },
    mode: 'onChange',
  });
  
  // Obter o valor atual do CEP do formulário
  const cepValue = form.watch('cep');
  
  // Aplicar debounce ao valor do CEP
  const [debouncedCep] = useDebounce(cepValue, 800);
  
  // Função para buscar endereço pelo CEP usando Brasil API
  const fetchAddressByCep = useCallback(async (cep: string): Promise<void> => {
    if (!cep || cep.length < 9) {
      setIsFetchingCep(false);
      return; // CEP incompleto (formato: 00000-000)
    }
    
    try {
      // Não definimos setIsFetchingCep(true) aqui, pois já foi definido no useEffect
      
      // Remover caracteres não numéricos para a consulta
      const cleanCep = cep.replace(/\D/g, '');
      
      // Usar a API pública do Brasil API
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      
      if (!response.ok) {
        throw new Error('CEP não encontrado');
      }
      
      const data: CepResponse = await response.json();
      
      // Preencher os campos de endereço com os dados retornados apenas se estiverem vazios
      const currentState = form.getValues('state');
      const currentCity = form.getValues('city');
      const currentNeighborhood = form.getValues('neighborhood');
      const currentStreetAddress = form.getValues('streetAddress');
      
      if (!currentState) form.setValue('state', data.state);
      if (!currentCity) form.setValue('city', data.city);
      if (!currentNeighborhood) form.setValue('neighborhood', data.neighborhood || '');
      if (!currentStreetAddress) form.setValue('streetAddress', data.street || '');
      
      // Trigger validation apenas para os campos que foram preenchidos
      form.trigger(['state', 'city', 'neighborhood', 'streetAddress']);
    } catch (err: unknown) {
      console.error('Erro ao buscar CEP:', err);
      // Não exibimos erro para o usuário para não interromper o fluxo
    } finally {
      setIsFetchingCep(false);
    }
  }, [form]); // Dependência: form
  
  // Efeito para buscar o endereço quando o CEP debounced mudar
  useEffect(() => {
    if (debouncedCep && debouncedCep.length === 9) { // Formato: 00000-000
      // Ativar o skeleton imediatamente quando o CEP estiver completo
      setIsFetchingCep(true);
      fetchAddressByCep(debouncedCep);
    }
  }, [debouncedCep, fetchAddressByCep]);

  // Função para avançar para o próximo passo com tipagem específica
  const handleNextStep = async (): Promise<void> => {
    try {
      // Validar apenas os campos do step atual
      const currentSchema = stepSchemas[currentStep - 1];
      const currentValues = form.getValues();

      await currentSchema.parseAsync(currentValues);

      setStepComplete((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
      setError('');
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // Formatar cada erro em uma linha separada
        setError(err.errors.map((e) => e.message).join('<br />'));
      }
    }
  };

  // Função onSubmit com tipos específicos
  const onSubmit = async (data: CadastroForm) => {
    try {
      setLoading(true);
      setError('');

      // Sanitizar todos os inputs
      const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (key === 'confirmPassword') return acc; // Não enviar confirmPassword

        if (typeof value === 'string') {
          acc[key] = sanitizeInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string | number | boolean | undefined>);

      // Enviar para a API com sessionId no header se disponível
      const headers: Record<string, string> = {};
      if (sessionId) {
        headers['Session-Id'] = sessionId;
      }

      await apiClient.post('/influencer/finalized-register', sanitizedData, {
        headers,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Erro ao cadastrar:', err);
      
      // Tipagem mais específica para o erro
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { 
          response?: { 
            data?: { 
              message?: string 
            } 
          } 
        };
        setError(apiError.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.');
      } else {
        setError('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen">
      <main className="flex justify-center items-center min-h-screen py-4 px-6 lg:px-10 bg-gradient-to-r from-blue-50 to-blue-100 lg:bg-gradient-to-r lg:from-blue-50 lg:to-blue-100 lg:bg-[url('/image/bg-cadastro.webp')] lg:bg-contain lg:bg-no-repeat">
        <div className="hidden lg:flex lg:w-1/2">
          <span></span>
        </div>
        <motion.div
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-[550px] flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Image
            src={logoImg}
            width={60}
            height={60}
            alt="Logo"
            className={`mb-4 ${loading ? 'animate-spin' : ''}`}
          />
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Cadastro de Afiliado OberShop
          </h2>
          <div className="overflow-y-auto w-full py-4 px-8 max-h-[60dvh]">
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center mb-4 w-full"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-center mb-4 w-full">
                Cadastro concluído com sucesso! Redirecionando...
              </div>
            )}

            <div className="flex justify-center items-center w-full gap-6 mb-8">
              {steps.map((step) => (
                <div
                  key={step}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full 
                ${
                  step === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : stepComplete.includes(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                } transition-all duration-300`}
                  onClick={() =>
                    stepComplete.includes(step) && setCurrentStep(step)
                  }
                >
                  {stepComplete.includes(step) ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="font-medium">{step}</span>
                  )}

                  {step < steps.length && (
                    <div
                      className={`absolute top-1/2 -right-7 w-6 h-0.5 
                  ${
                    stepComplete.includes(step) ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            E-mail <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu e-mail"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Senha <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite sua senha"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Confirmar Senha{' '}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirme sua senha"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codeCoupon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Código do Cupom{' '}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o código do cupom"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Nome Completo{' '}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome completo"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            CPF <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(cpfMask(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            CNPJ (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00.000.000/0000-00"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(cnpjMask(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Telefone <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(phoneMask(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            CEP <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field}
                                onChange={(e) => {
                                  const maskedValue = cepMask(e.target.value);
                                  field.onChange(maskedValue);
                                }}
                              />
                            </FormControl>
                            {isFetchingCep && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Estado <span className="text-red-500">*</span>
                          </FormLabel>
                          {isFetchingCep && cepValue.length === 9 ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <FormControl>
                              <Input
                                placeholder="Estado"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(sanitizeInput(e.target.value))
                                }
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Cidade <span className="text-red-500">*</span>
                          </FormLabel>
                          {isFetchingCep && cepValue.length === 9 ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <FormControl>
                              <Input
                                placeholder="Cidade"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(sanitizeInput(e.target.value))
                                }
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Bairro <span className="text-red-500">*</span>
                          </FormLabel>
                          {isFetchingCep && cepValue.length === 9 ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <FormControl>
                              <Input
                                placeholder="Bairro"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(sanitizeInput(e.target.value))
                                }
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Rua <span className="text-red-500">*</span>
                          </FormLabel>
                          {isFetchingCep && cepValue.length === 9 ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <FormControl>
                              <Input
                                placeholder="Rua"
                                className="border-gray-300 text-gray-800 focus:border-blue-500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(sanitizeInput(e.target.value))
                                }
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numberAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Número <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Número"
                              className="border-gray-300 text-gray-800 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(sanitizeInput(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-700"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      disabled={loading}
                    >
                      Voltar
                    </Button>
                  )}

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                      onClick={handleNextStep}
                      disabled={loading}
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="button" // Alterado de "submit" para "button"
                      className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={loading}
                    >
                      {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já possui uma conta?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Faça login
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
