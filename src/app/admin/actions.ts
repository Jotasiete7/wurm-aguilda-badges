'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { isValidImageUrl, truncate, generateSecureCode } from '@/lib/utils';

const VALID_CATEGORIES = ['Evento', 'Ofício', 'Contribuição', 'Combate', 'Território', 'Segredo'];
const VALID_RARITIES = ['Comum', 'Rara', 'Epica', 'Lendaria'];

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const { data: admin } = await db.from('admins').select('id').eq('discord_id', session.user.id).single();
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
  const max_supply = formData.get('max_supply') ? parseInt(formData.get('max_supply') as string, 10) : null;

  if (!name) return { success: false, message: 'Nome é obrigatório.' };
  if (!isValidImageUrl(image_url)) return { success: false, message: 'URL da imagem inválida. Use um link HTTPS direto.' };
  if (!VALID_CATEGORIES.includes(category)) return { success: false, message: 'Categoria inválida.' };
  if (!VALID_RARITIES.includes(rarity)) return { success: false, message: 'Raridade inválida.' };

  const id = crypto.randomUUID();
  await db.from('badges').insert({ id, name, description, image_url, category, rarity, max_supply });

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
  const max_supply = formData.get('max_supply') ? parseInt(formData.get('max_supply') as string, 10) : null;

  if (!id) return { success: false, message: 'ID inválido.' };
  if (!name) return { success: false, message: 'Nome é obrigatório.' };
  if (!isValidImageUrl(image_url)) return { success: false, message: 'URL da imagem inválida. Use um link HTTPS direto.' };
  if (!VALID_CATEGORIES.includes(category)) return { success: false, message: 'Categoria inválida.' };
  if (!VALID_RARITIES.includes(rarity)) return { success: false, message: 'Raridade inválida.' };

  await db.from('badges').update({ name, description, image_url, category, rarity, max_supply }).eq('id', id);

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
  const note = (formData.get('note') as string || '').trim();

  if (!badge_id) return { success: false, message: 'Selecione uma insígnia.' };
  if (!rawCode) return { success: false, message: 'Código não pode estar vazio.' };
  if (rawCode.length < 3 || rawCode.length > 40) return { success: false, message: 'Código deve ter entre 3 e 40 caracteres.' };

  // Ensure badge exists
  const { data: badge } = await db.from('badges').select('id').eq('id', badge_id).single();
  if (!badge) return { success: false, message: 'Insígnia não encontrada.' };

  const code = rawCode.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
  const uses = max_uses ? parseInt(max_uses, 10) : null;
  const expiry = expires_at ? expires_at : null;
  const id = crypto.randomUUID();

  try {
    const { error } = await db.from('codes').insert({ id, code, badge_id, max_uses: uses, expires_at: expiry, note: note || null });
    if (error) {
      if (error.code === '23505') return { success: false, message: 'Esse código já existe. Escolha outro.' };
      throw error;
    }
  } catch (e: any) {
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
  const { data: user } = await db.from('users').select('id').eq('discord_id', discord_id).single();
  if (!user) return { success: false, message: 'Usuário não encontrado. O membro precisa ter feito login pelo menos uma vez.' };

  // Avoid duplicates
  const { data: hasBadge } = await db.from('user_badges').select('id').eq('user_id', discord_id).eq('badge_id', badge_id).single();
  if (hasBadge) return { success: false, message: 'Este membro já possui essa insígnia.' };

  const id = crypto.randomUUID();
  await db.from('user_badges').insert({ id, user_id: discord_id, badge_id, source: 'manual' });

  revalidatePath('/admin');
  return { success: true, message: 'Insígnia concedida com sucesso!' };
}

export async function updateDisplayName(formData: FormData) {
  await checkAdmin();

  const discord_id = (formData.get('discord_id') as string || '').trim();
  const display_name = truncate((formData.get('display_name') as string || '').trim(), 40);

  if (!discord_id) return { success: false, message: 'ID do membro inválido.' };

  const { error } = await db.from('users').update({ display_name: display_name || null }).eq('discord_id', discord_id);
  if (error) return { success: false, message: 'Erro ao salvar. Tente novamente.' };

  revalidatePath('/admin');
  revalidatePath('/wallet');
  return { success: true, message: display_name ? `Nick atualizado para "${display_name}"!` : 'Nick personalizado removido.' };
}

export async function toggleAdmin(formData: FormData) {
  await checkAdmin();

  const discord_id = (formData.get('discord_id') as string || '').trim();
  const action = formData.get('action') as string;

  if (!discord_id) return { success: false, message: 'ID inválido.' };

  if (action === 'add') {
    const { data: exists } = await db.from('admins').select('id').eq('discord_id', discord_id).single();
    if (exists) return { success: false, message: 'Este membro já é admin.' };
    await db.from('admins').insert({ discord_id });
    revalidatePath('/admin');
    return { success: true, message: 'Admin concedido com sucesso!' };
  } else {
    await db.from('admins').delete().eq('discord_id', discord_id);
    revalidatePath('/admin');
    return { success: true, message: 'Admin removido.' };
  }
}
