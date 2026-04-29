import { headers } from 'next/headers';
import db from './db';

/** 
 * Verifica se um usuário ou IP excedeu o limite de tentativas de resgate.
 * Limite: 5 tentativas por minuto.
 */
export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  // Busca tentativas recentes para este usuário OU este IP
  const { data: attempts, error } = await db
    .from('security_logs')
    .select('id')
    .or(`user_id.eq.${userId},ip_address.eq.${ip}`)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (error) {
    console.error('Erro ao verificar rate limit:', error);
    return { allowed: true, remaining: 5 }; // Falha segura: permite se o banco der erro
  }

  const count = attempts?.length || 0;
  const limit = 5;

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count)
  };
}

/** Registra uma tentativa de resgate (sucesso ou falha) */
export async function logRedemptionAttempt(userId: string, code: string, success: boolean) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';

  await db.from('security_logs').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    ip_address: ip,
    action: 'redeem_code',
    details: { code, success }
  });
}
