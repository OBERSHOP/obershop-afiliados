"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { z } from "zod";
import api from "@/services/api";
import Image from "next/image";

import "./change-password.css";

// Validação de senha usando Zod
const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
  .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." })
  .regex(/\d/, { message: "A senha deve conter pelo menos um número." })
  .regex(/[^a-zA-Z0-9]/, { message: "A senha deve conter pelo menos um caractere especial (@, #, $, etc.)." });

function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Captura o e-mail e o token da URL
    const emailParam = searchParams.get("username");
    const tokenParam = searchParams.get("sessionId");

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setSessionId(tokenParam);
    } else {
      setError("Link inválido ou expirado.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      await api.post(
        "/auth/change-password",
        { email, password },
        { headers: { "Session-Id": sessionId } }
      );

      setSuccess(true);
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join("\n");
        setError(errorMessages);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="changePasswordMain__container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Image
        src={"/assets/image/loadlogo.png"}
        width={50}
        height={50}
        alt="Logo"
        className={`mb-2 ${loading ? "animate-spin" : ""}`}
      />

      <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
        Recuperar Senha
      </h2>

      {error && (
        <motion.div
          className="text-red-500 text-center bg-red-100 border border-red-400 p-3 rounded"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {error.split("\n").map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </motion.div>
      )}
      {success && (
        <p className="text-green-500 text-center mb-4">
          Senha alterada com sucesso! Redirecionando...
        </p>
      )}

      <form onSubmit={handleSubmit} className="changePasswordMain__form">
        <div className="changePasswordMain__stepInput">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" className="bg-gray-200" value={email} disabled />
        </div>

        <div className="changePasswordMain__stepInput">
          <label htmlFor="password">Nova Senha</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Digite sua nova senha"
            value={password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="changePasswordMain__stepInput">
          <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button className="submitButton" type="submit" disabled={loading}>
          {loading ? "Alterando..." : "Alterar Senha"}
        </button>
      </form>
    </motion.div>
  );
}

export default function ChangePasswordPage() {
  return (
    <main className="changePasswordMain">
      <Suspense fallback={<p>Carregando...</p>}>
        <ChangePasswordForm />
      </Suspense>
    </main>
  );
}
