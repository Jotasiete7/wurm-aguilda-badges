'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, logRedemptionAttempt } from '@/lib/security';

export async function redeemCode(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Usuário não autenticado." };

  // 1. Rate Limiting Check
  const { allowed, remaining } = await checkRateLimit(session.user.id);
  if (!allowed) {
    return { success: false, error: "Muitas tentativas. Aguarde um minuto e tente novamente." };
  }

  const rawCode = formData.get('code') as string;
  if (!rawCode?.trim()) return { success: false, error: "Código vazio." };

  const codeStr = rawCode.trim().toUpperCase();

  try {
    // 2. Atomic Redemption via Supabase RPC
    // Isso resolve a Race Condition e faz todas as verificações em uma única transação
    const { data, error: rpcError } = await db.rpc('redeem_code_atomic', {
      p_code: codeStr,
      p_user_id: session.user.id
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw new Error("Erro interno ao processar resgate.");
    }

    const result = data as { success: boolean; error?: string };

    // 3. Log attempt
    await logRedemptionAttempt(session.user.id, codeStr, result.success);

    if (!result.success) {
      // Mensagens genéricas para evitar vazamento de informações para atacantes
      if (result.error === 'OWNED') throw new Error("Você já possui esta Insígnia.");
      if (result.error === 'INVALID' || result.error === 'EXPIRED' || result.error === 'EXHAUSTED') {
        throw new Error("Código inválido, expirado ou esgotado.");
      }
      throw new Error("Não foi possível resgatar este código.");
    }

    revalidatePath('/wallet');
    return { success: true, message: "Insígnia resgatada com sucesso! ✨" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
