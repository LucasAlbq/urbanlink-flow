import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  // Sem tamanho mínimo no login: senha curta só pode estar errada, e isso é um 401, não um 422.
  password: z.string().min(1).max(128),
  // "Manter conectado": o cookie da sessão dura até o token vencer.
  remember: z.boolean().default(false),
});

export const passwordResetRequestSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const passwordResetConfirmSchema = z.object({
  // O formato do token não é conferido aqui: link estranho também é "inválido ou vencido" (400).
  token: z.string().min(1).max(200),
  // A mesma regra da senha dos usuários.
  password: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
