import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../shared/errors.js';

// Recuperar senha do site: pedir o link e criar a senha nova com ele.
// O token só existe no link; o banco guarda o SHA-256 dele (password_reset_tokens).

export const hashResetToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

const invalidResetToken = (): AppError =>
  new AppError(400, 'INVALID_RESET_TOKEN', 'O link de senha nova é inválido ou já venceu.');

// Ainda não tem envio de e-mail: fora de produção, o link aparece no terminal da API pra
// demonstração. Em produção, nada é registrado (o token nunca vai pro log).
function deliverResetLink(email: string, link: string): void {
  if (env.NODE_ENV === 'production' || env.LOG_LEVEL === 'silent') return;
  console.info(
    `[recuperar senha] Link de senha nova pra ${email} (vale ${env.PASSWORD_RESET_TTL_MINUTES} min): ${link}`,
  );
}

// Responde igual exista ou não a conta: quem chama nunca sabe se o e-mail está cadastrado.
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  });
  if (user === null || user.status !== 'ACTIVE') return;

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000);
  // Um pedido novo cancela os anteriores que ainda não foram usados.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt },
    }),
  ]);
  deliverResetLink(email, `${env.APP_URL.replace(/\/$/, '')}/nova-senha/${token}`);
}

// Troca a senha e queima o link. Devolve o id do usuário pra auditoria.
export async function resetPassword(token: string, password: string): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.$transaction(async (transaction) => {
    const reset = await transaction.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      include: { user: { select: { status: true } } },
    });
    if (
      reset === null ||
      reset.usedAt !== null ||
      reset.expiresAt.getTime() <= Date.now() ||
      reset.user.status !== 'ACTIVE'
    ) {
      throw invalidResetToken();
    }

    // Marca como usado só se ninguém usou antes: dois envios ao mesmo tempo não trocam a senha duas vezes.
    const claimed = await transaction.passwordResetToken.updateMany({
      where: { id: reset.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw invalidResetToken();

    await transaction.user.update({ where: { id: reset.userId }, data: { passwordHash } });
    await transaction.passwordResetToken.deleteMany({
      where: { userId: reset.userId, usedAt: null },
    });
    return reset.userId;
  });
}
