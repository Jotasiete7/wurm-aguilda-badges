'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { isValidImageUrl, truncate } from '@/lib/utils';

const VALID_CATEGORIES = ['Evento', 'Ofício', 'Contribuição', 'Combate', 'Território', 'Segredo'];
const VALID_RARITIES = ['Comum', 'Rara', 'Epica', 'Lendaria'];

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const admin = db.prepare('SELECT id FROM admins WHERE discord_id = ?').get(session.user.id);
  if (!admin) throw new Error("Forbidden");
  return session.user.id;
}

export async function createBadge(formData: FormData) {
  await checkAdmin();

  const name = truncate((formData.get('name') as string || '').trim(), 80);
  const description = truncate((formData.get('description') as string || '').trim(), 500);
  const image_url = (formData.get('image_url') as string || '').trim();
  const category = formData.get('category') as string;
  const rarity = formData.get('rarity') as string;

  if (!name) return { success: false, message: 'Nome é obrigatório.' };
  if (!isValidImageUrl(image_url)) return { success: false, message: 'URL da imagem inválida. Use um link HTTPS direto.' };
  if (!VALID_CATEGORIES.includes(category)) return { success: false, message: 'Categoria inválida.' };
  if (!VALID_RARITIES.includes(rarity)) return { success: false, message: 'Raridade inválida.' };

  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO badges (id, name, description, image_url, category, rarity) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, name, description, image_url, category, rarity);

  revalidatePath('/admin');
  return { success: true, message: 'Insígnia forjada com sucesso!' };
}

export async function updateBadge(formData: FormData) {
  await checkAdmin();

  const id = formData.get('id') as string;
  const name = truncate((formData.get('name') as string || '').trim(), 80);
  const description = truncate((formData.get('description') as string || '').trim(), 500);
  const image_url = (formData.get('image_url') as string || '').trim();
  const category = formData.get('category') as string;
  const rarity = formData.get('rarity') as string;

  if (!id) return { success: false, message: 'ID inválido.' };
  if (!name) return { success: false, message: 'Nome é obrigatório.' };
  if (!isValidImageUrl(image_url)) return { success: false, message: 'URL da imagem inválida. Use um link HTTPS direto.' };
  if (!VALID_CATEGORIES.includes(category)) return { success: false, message: 'Categoria inválida.' };
  if (!VALID_RARITIES.includes(rarity)) return { success: false, message: 'Raridade inválida.' };

  db.prepare(`UPDATE badges SET name=?, description=?, image_url=?, category=?, rarity=? WHERE id=?`)
    .run(name, description, image_url, category, rarity, id);

  revalidatePath('/admin');
  revalidatePath('/wallet');
  return { success: true, message: 'Insígnia atualizada com sucesso!' };
}

export async function createCode(formData: FormData) {
  await checkAdmin();

  const badge_id = (formData.get('badge_id') as string || '').trim();
  const rawCode = (formData.get('code') as string || '').trim();
  const max_uses = formData.get('max_uses') as string;
  const expires_at = formData.get('expires_at') as string;

  if (!badge_id) return { success: false, message: 'Selecione uma insígnia.' };
  if (!rawCode) return { success: false, message: 'Código não pode estar vazio.' };
  if (rawCode.length < 3 || rawCode.length > 40) return { success: false, message: 'Código deve ter entre 3 e 40 caracteres.' };

  // Ensure badge exists
  const badge = db.prepare('SELECT id FROM badges WHERE id = ?').get(badge_id);
  if (!badge) return { success: false, message: 'Insígnia não encontrada.' };

  const code = rawCode.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
  const uses = max_uses ? parseInt(max_uses, 10) : null;
  const expiry = expires_at ? expires_at : null;
  const id = crypto.randomUUID();

  try {
    db.prepare(`INSERT INTO codes (id, code, badge_id, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)`)
      .run(id, code, badge_id, uses, expiry);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return { success: false, message: 'Esse código já existe. Escolha outro.' };
    throw e;
  }

  revalidatePath('/admin');
  return { success: true, message: `Código "${code}" gerado!` };
}

export async function assignBadgeManually(formData: FormData) {
  await checkAdmin();

  const badge_id = (formData.get('badge_id') as string || '').trim();
  const discord_id = (formData.get('discord_id') as string || '').trim();

  if (!badge_id || !discord_id) return { success: false, message: 'Preencha todos os campos.' };

  // Check user exists
  const user = db.prepare('SELECT id FROM users WHERE discord_id = ?').get(discord_id);
  if (!user) return { success: false, message: 'Usuário não encontrado. O membro precisa ter feito login pelo menos uma vez.' };

  // Avoid duplicates
  const hasBadge = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(discord_id, badge_id);
  if (hasBadge) return { success: false, message: 'Este membro já possui essa insígnia.' };

  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO user_badges (id, user_id, badge_id, source) VALUES (?, ?, ?, 'manual')`)
    .run(id, discord_id, badge_id);

  revalidatePath('/admin');
  return { success: true, message: 'Insígnia concedida com sucesso!' };
}
