'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Helper to check admin access
async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const admin = db.prepare('SELECT id FROM admins WHERE discord_id = ?').get(session.user.id);
  if (!admin) throw new Error("Forbidden");
  return session.user.id;
}

export async function createBadge(formData: FormData) {
  await checkAdmin();
  const id = crypto.randomUUID();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const category = formData.get('category') as string;
  const rarity = formData.get('rarity') as string;
  db.prepare(`INSERT INTO badges (id, name, description, image_url, category, rarity) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, name, description, image_url, category, rarity);
  revalidatePath('/admin');
  return { success: true, message: 'Badge criada com sucesso!' };
}

export async function updateBadge(formData: FormData) {
  await checkAdmin();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const category = formData.get('category') as string;
  const rarity = formData.get('rarity') as string;
  db.prepare(`UPDATE badges SET name=?, description=?, image_url=?, category=?, rarity=? WHERE id=?`)
    .run(name, description, image_url, category, rarity, id);
  revalidatePath('/admin');
  revalidatePath('/wallet');
  return { success: true, message: 'Badge atualizada com sucesso!' };
}

export async function createCode(formData: FormData) {
  await checkAdmin();
  const id = crypto.randomUUID();
  const badge_id = formData.get('badge_id') as string;
  const rawCode = formData.get('code') as string;
  const max_uses = formData.get('max_uses') as string;
  const code = rawCode.trim().toUpperCase();
  const uses = max_uses ? parseInt(max_uses, 10) : null;
  db.prepare(`INSERT INTO codes (id, code, badge_id, max_uses) VALUES (?, ?, ?, ?)`)
    .run(id, code, badge_id, uses);
  revalidatePath('/admin');
  return { success: true, message: 'Código gerado com sucesso!' };
}

export async function assignBadgeManually(formData: FormData) {
  await checkAdmin();
  const id = crypto.randomUUID();
  const badge_id = formData.get('badge_id') as string;
  const discord_id = (formData.get('discord_id') as string).trim();
  db.prepare(`INSERT INTO user_badges (id, user_id, badge_id, source) VALUES (?, ?, ?, 'manual')`)
    .run(id, discord_id, badge_id);
  revalidatePath('/admin');
  return { success: true, message: 'Badge atribuída com sucesso!' };
}
