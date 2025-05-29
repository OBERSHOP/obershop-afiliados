'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { z } from 'zod';
import Image from 'next/image';
import { api } from '@/lib/api';
import '@/app/globals.css';

import logoImg from '@/../public/image/loadlogo.png';

const steps = [1, 2, 3];

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

// Validação com Zod por step
const stepSchemas = [
  z.object({
    email: z.string().email('Formato de e-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha precisa conter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'A senha precisa conter no mínimo 1 letra maiúscula')
      .regex(/\d/, 'A senha precisa conter no mínimo 1 número')
      .regex(/[^a-zA-Z0-9]/, 'A senha precisa conter no mínimo 1 caractere especial'),
    codeCoupon: z.string().min(1, 'Código do Cupom obrigatório'),
  }),
  z.object({
    fullName: z.string().min(3, 'Nome completo obrigatório'),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    cnpj: z.string().optional(),
    phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
  }),
  z.object({
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    state: z.string().min(2, 'Estado obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    neighborhood: z.string().min(2, 'Bairro obrigatório'),
    streetAddress: z.string().min(2, 'Rua obrigatória'),
    numberAddress: z.string().min(1, 'Número obrigatório'),
  }),
];

interface CadastroForm {
  cpf: string;
  cnpj?: string;
  fullName: string;
  profilePicture?: File | null;
  password: string;
  phone: string;
  codeCoupon: string;
  email: string;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  streetAddress: string;
  numberAddress: string;
}

export default function CadastroPage() {
  const [form, setForm] = useState<CadastroForm>({
    cpf: '',
    cnpj: '',
    fullName: '',
    profilePicture: null,
    password: '',
    phone: '',
    codeCoupon: '',
    email: '',
    cep: '',
    state: '',
    city: '',
    neighborhood: '',
    streetAddress: '',
    numberAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [influencerId, setInfluencerId] = useState('');
  const [leader, setLeader] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [stepComplete, setStepComplete] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('sessionId') || '');
    setInfluencerId(params.get('influencerId') || '');
    setLeader(params.get('leader') || '');
  }, []);

  useEffect(() => {
    setError(null);
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'cpf') maskedValue = cpfMask(value);
    if (name === 'cnpj') maskedValue = cnpjMask(value);
    if (name === 'phone') maskedValue = phoneMask(value);
    if (name === 'cep') maskedValue = cepMask(value);
    setForm((prev) => ({ ...prev, [name]: maskedValue }));
  };

  const handleNextStep = () => {
    try {
      stepSchemas[currentStep - 1].parse(form);
      setStepComplete((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Formatar cada erro em uma linha separada
        setError(err.errors.map((e) => e.message).join("<br />"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < steps.length) {
      handleNextStep();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primeiro envio para /auth/save
      const saveResponse = await api.post(
        '/auth/save',
        {
          cpf: form.cpf.replace(/\D/g, ''),
          cnpj: form.cnpj ? form.cnpj.replace(/\D/g, '') : undefined,
          profilePicture: form.profilePicture,
          fullName: form.fullName,
          password: form.password,
          email: form.email,
        },
        { headers: { 'Session-Id': sessionId } },
      );

      if (saveResponse.status === 200) {
        try {
          await api.put(
            '/influencer',
            {
              influencerId,
              ...form,
              cpf: form.cpf.replace(/\D/g, ''),
              phone: form.phone.replace(/\D/g, ''),
              cep: form.cep.replace(/\D/g, ''),
              leader,
            },
            { headers: { 'Session-Id': sessionId } },
          );

          setSuccess(true);
          setTimeout(() => router.replace('/login'), 3000);
        } catch {
          if (form.cpf) {
            await api.delete(`/auth`, {
              params: { cpf: form.cpf.replace(/\D/g, '') },
            });
          }
          setError('Erro ao cadastrar.');
        }
      }
    } catch {
      setError('Erro ao validar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col justify-center items-center min-h-screen py-4 px-6 lg:px-10 lg:items-end backgroundCadastro bg-white">
      <div className="absolute inset-0 z-[-1] hidden lg:block">

      </div>

      <motion.div
        className="bg-white p-8 rounded-lg shadow-2xl border-[2px] border-solid border-[#1f1f1f7c] w-full max-w-[500px] flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Image
          src={logoImg}
          width={50}
          height={50}
          alt="Logo"
          className={`mb-2 ${loading ? 'animate-spin' : ''}`}
        />
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Cadastro de Afiliado OberShop
        </h2>
        {error && (
          <div 
            className="text-red-500 text-center mb-4"
            dangerouslySetInnerHTML={{ __html: error }}
          />
        )}
        {success && (
          <p className="text-green-500 text-sm text-center mb-4">
            Cadastro concluído com sucesso!
          </p>
        )}

        <div className="flex justify-center items-center w-full gap-10 mb-5">
          {steps.map((step) => (
            <div
              key={step}
              className={`border-[3px] border-primary bg-primary hover:border-blue-600 hover:bg-blue-500 transition border-solid w-[50px] h-[50px] rounded-full cursor-pointer flex items-center justify-center ${
                step === currentStep ? 'current' : ''
              } ${stepComplete.includes(step) ? 'completed' : 'pending'}`}
            >
              <p className="font-bold text-xl text-white">{step}</p>
              {stepComplete.includes(step) && (
                <div className="success-checkmark">
                  <div className="check-icon">
                    <span className="icon-line line-tip"></span>
                    <span className="icon-line line-long"></span>
                    <div className="icon-circle"></div>
                    <div className="icon-fix"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-h-screen w-full overflow-y-auto px-3 py-5"
        >
          {currentStep === 1 && (
            <div className="space-y-4 w-full flex flex-col items-center justify-center gap-2">
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={form.email}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="password"
                name="password"
                placeholder="Senha"
                value={form.password}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="codeCoupon"
                placeholder="Código do Cupom"
                value={form.codeCoupon}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 w-full flex flex-col items-center justify-center gap-2">
              <input
                type="text"
                name="fullName"
                placeholder="Nome Completo"
                value={form.fullName}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="cpf"
                placeholder="CPF"
                value={form.cpf}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="cnpj"
                placeholder="CNPJ (Opcional)"
                value={form.cnpj}
                onChange={handleChange}
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="phone"
                placeholder="Telefone"
                value={form.phone}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 w-full flex flex-col items-center justify-center gap-2">
              <input
                type="text"
                name="cep"
                placeholder="CEP"
                value={form.cep}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="state"
                placeholder="Estado"
                value={form.state}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="city"
                placeholder="Cidade"
                value={form.city}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="neighborhood"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="Rua"
                value={form.streetAddress}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
              <input
                type="text"
                name="numberAddress"
                placeholder="Número"
                value={form.numberAddress}
                onChange={handleChange}
                required
                className="py-3 px-4 w-full border-[1px] border-solid border-gray-500 rounded-lg text-gray-800"
              />
            </div>
          )}

          <div className="flex justify-around mt-6 flex-row gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-blue-600 hover:bg-blue-500 transition text-white py-3 px-5 rounded-lg"
              >
                Voltar
              </button>
            )}
            {currentStep === steps.length && (
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 transition text-white py-3 px-5 rounded-lg"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            )}

            {currentStep < steps.length && (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-500 transition text-white py-3 px-5 rounded-lg"
              >
                Próximo
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </main>
  );
}
