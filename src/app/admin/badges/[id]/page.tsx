import React from 'react';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import { updateBadge } from '../../actions';
import styles from './edit.module.css';

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  rarity: string;
}

export default async function EditBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const isAdmin = db.prepare('SELECT id FROM admins WHERE discord_id = ?').get(session.user.id);
  if (!isAdmin) redirect('/wallet');

  const badge = db.prepare('SELECT * FROM badges WHERE id = ?').get(id) as Badge | undefined;
  if (!badge) notFound();

  // Count how many users have this badge
  const count = (db.prepare('SELECT COUNT(*) as total FROM user_badges WHERE badge_id = ?').get(id) as any).total;

  async function handleUpdate(formData: FormData) {
    'use server';
    formData.set('id', badge!.id);
    await updateBadge(formData);
    redirect('/admin');
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <div className={styles.breadcrumb}>
          <a href="/admin">← Painel da Guilda</a>
        </div>

        <div className={styles.layout}>
          {/* Preview */}
          <div className={styles.preview}>
            <div className={`${styles.previewCard} ${styles[`rarity-${badge.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`]}`}>
              <img
                src={badge.image_url}
                alt={badge.name}
                className={styles.previewImg}
              />
            </div>
            <h2 className={styles.previewName}>{badge.name}</h2>
            <div className={styles.previewMeta}>
              <span className={styles.previewRarity}>{badge.rarity}</span>
              <span className={styles.previewCategory}>{badge.category}</span>
            </div>
            <div className={styles.previewStats}>
              <p className={styles.statNumber}>{count}</p>
              <p className={styles.statLabel}>membros possuem esta insígnia</p>
            </div>
          </div>

          {/* Formulário */}
          <div className={styles.formCard}>
            <h1 className={styles.title}>Editar Insígnia</h1>
            <form action={handleUpdate} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nome</label>
                <input type="text" name="name" defaultValue={badge.name} className="input" required />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea name="description" defaultValue={badge.description || ''} className={`input ${styles.textarea}`} rows={3} />
              </div>

              <div className={styles.formGroup}>
                <label>URL da Imagem</label>
                <input type="text" name="image_url" defaultValue={badge.image_url} className="input" required />
                <small className={styles.hint}>Use o link direto da imagem (ex: https://i.postimg.cc/...)</small>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select name="category" className="input" defaultValue={badge.category}>
                    <option value="Evento">Evento</option>
                    <option value="Ofício">Ofício</option>
                    <option value="Contribuição">Contribuição</option>
                    <option value="Combate">Combate</option>
                    <option value="Território">Território</option>
                    <option value="Segredo">Segredo</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Raridade</label>
                  <select name="rarity" className="input" defaultValue={badge.rarity}>
                    <option value="Comum">Comum</option>
                    <option value="Rara">Rara</option>
                    <option value="Epica">Épica</option>
                    <option value="Lendaria">Lendária</option>
                  </select>
                </div>
              </div>

              <div className={styles.actions}>
                <a href="/admin" className="btn">Cancelar</a>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
