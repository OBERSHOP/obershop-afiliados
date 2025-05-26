import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail ou senha inválidos")
    .max(100, "E-mail ou senha inválidos")
    .email("E-mail ou senha inválidos")
    .refine(
      (val) => !/['";<>!?]/.test(val),
      "E-mail ou senha inválidos"
    ),

  password: z
    .string()
    .min(6, "E-mail ou senha inválidos")
    .max(100, "E-mail ou senha inválidos")
    .refine(
      (val) => !/['";]/.test(val),
      "E-mail ou senha inválidos"
    ),
});

export type LoginSchema = z.infer<typeof loginSchema>;
