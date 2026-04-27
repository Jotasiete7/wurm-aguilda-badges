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
    const executeRedeem = db.transaction(() => {
      // 1. Validate code exists and is not expired
      const codeRecord = db.prepare(`
        SELECT id, badge_id, max_uses, used_count 
        FROM codes 
        WHERE code = ? 
          AND (expires_at IS NULL OR expires_at > datetime('now'))
      `).get(codeStr) as any;

      if (!codeRecord) throw new Error("Código inválido, expirado ou inexistente.");

      // 2. Check uses limit
      if (codeRecord.max_uses !== null && codeRecord.used_count >= codeRecord.max_uses) {
        throw new Error("Este código já atingiu seu limite máximo de usos.");
      }

      // 3. Prevent duplicate badge ownership
      const hasBadge = db.prepare(
        'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?'
      ).get(session.user?.id, codeRecord.badge_id);

      if (hasBadge) throw new Error("Você já possui esta Insígnia em sua mochila.");

      // 4. Insert badge ownership
      db.prepare(
        `INSERT INTO user_badges (id, user_id, badge_id, source) VALUES (?, ?, ?, 'code')`
      ).run(crypto.randomUUID(), session.user?.id, codeRecord.badge_id);

      // 5. Record redemption
      db.prepare(
        `INSERT INTO code_redemptions (id, code_id, user_id) VALUES (?, ?, ?)`
      ).run(crypto.randomUUID(), codeRecord.id, session.user?.id);

      // 6. Increment use count
      db.prepare(`UPDATE codes SET used_count = used_count + 1 WHERE id = ?`)
        .run(codeRecord.id);

      return true;
    });

    executeRedeem();
    revalidatePath('/wallet');
    return { success: true, message: "Insígnia resgatada com sucesso! ✨" };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
