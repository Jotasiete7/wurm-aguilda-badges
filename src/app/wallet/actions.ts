'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function redeemCode(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Usuário não autenticado." };

  const rawCode = formData.get('code') as string;
  if (!rawCode?.trim()) return { success: false, error: "Código vazio." };

  const codeStr = rawCode.trim().toUpperCase();

  try {
    // 1. Validate code exists and is not expired
    const { data: codeRecord } = await db.from('codes').select('*').eq('code', codeStr).single();

    if (!codeRecord) throw new Error("Código inválido ou inexistente.");
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      throw new Error("Código expirado.");
    }

    // 2. Check uses limit
    if (codeRecord.max_uses !== null && codeRecord.used_count >= codeRecord.max_uses) {
      throw new Error("Este código já atingiu seu limite máximo de usos.");
    }

    // 3. Prevent duplicate badge ownership
    const { data: hasBadge } = await db.from('user_badges').select('id').eq('user_id', session.user.id).eq('badge_id', codeRecord.badge_id).single();

    if (hasBadge) throw new Error("Você já possui esta Insígnia em sua mochila.");

    // 4. Insert badge ownership
    await db.from('user_badges').insert({ id: crypto.randomUUID(), user_id: session.user.id, badge_id: codeRecord.badge_id, source: 'code' });

    // 5. Record redemption
    await db.from('code_redemptions').insert({ id: crypto.randomUUID(), code_id: codeRecord.id, user_id: session.user.id });

    // 6. Increment use count
    await db.from('codes').update({ used_count: codeRecord.used_count + 1 }).eq('id', codeRecord.id);
    revalidatePath('/wallet');
    return { success: true, message: "Insígnia resgatada com sucesso! ✨" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
