import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import styles from './admin.module.css';
import { createBadge, createCode, assignBadgeManually } from './actions';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  // Check if admin
  const stmtAdmin = db.prepare('SELECT id FROM admins WHERE discord_id = ?');
  const isAdmin = stmtAdmin.get(session.user.id);

  if (!isAdmin) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <main className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h1>Acesso Negado</h1>
          <p>Você não possui privilégios da Guilda para acessar esta área.</p>
        </main>
      </div>
    );
  }

  // Fetch all badges to populate dropdowns
  const badgesStmt = db.prepare('SELECT id, name FROM badges ORDER BY created_at DESC');
  const badges = badgesStmt.all() as { id: string, name: string }[];

  const codesStmt = db.prepare('SELECT codes.*, badges.name as badge_name FROM codes JOIN badges ON codes.badge_id = badges.id ORDER BY codes.created_at DESC');
  const codes = codesStmt.all() as any[];

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <h1 className={styles.title}>Painel da Guilda</h1>
        
        <div className={styles.grid}>
          {/* Card: Criar Badge */}
          <div className="card">
            <h2>Criar Nova Insígnia</h2>
            <form action={createBadge} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nome</label>
                <input type="text" name="name" className="input" required />
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input type="text" name="description" className="input" />
              </div>
              <div className={styles.formGroup}>
                <label>URL da Imagem (Ex: Imgur/Discord)</label>
                <input type="url" name="image_url" className="input" required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select name="category" className="input" required>
                    <option value="Evento">Evento</option>
                    <option value="Ofício">Ofício</option>
                    <option value="Contribuição">Contribuição</option>
                    <option value="Combate">Combate</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Raridade</label>
                  <select name="rarity" className="input" required>
                    <option value="Comum">Comum</option>
                    <option value="Rara">Rara</option>
                    <option value="Epica">Épica</option>
                    <option value="Lendaria">Lendária</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Forjar Insígnia</button>
            </form>
          </div>

          {/* Card: Criar Código */}
          <div className="card">
            <h2>Gerar Código de Resgate</h2>
            <form action={createCode} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Selecionar Insígnia</label>
                <select name="badge_id" className="input" required>
                  {badges.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                  {badges.length === 0 && <option value="">Nenhuma insígnia forjada ainda</option>}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Código Personalizado (Ex: GUILDA-2024)</label>
                <input type="text" name="code" className="input" required />
              </div>
              <div className={styles.formGroup}>
                <label>Limite de Usos (Vazio = Ilimitado)</label>
                <input type="number" name="max_uses" className="input" min="1" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Gerar Código</button>
            </form>
          </div>

          {/* Card: Atribuir Manualmente */}
          <div className="card">
            <h2>Atribuir Manualmente</h2>
            <form action={assignBadgeManually} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Selecionar Insígnia</label>
                <select name="badge_id" className="input" required>
                  {badges.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Discord ID do Membro</label>
                <input type="text" name="discord_id" className="input" required />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }}>Conceder</button>
            </form>
          </div>
        </div>

        <h2 style={{marginTop: '3rem', marginBottom: '1rem'}}>Códigos Ativos</h2>
        <div style={{overflowX: 'auto'}}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Insígnia Associada</th>
                <th>Usos</th>
                <th>Limite</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign: 'center', opacity: 0.5}}>Nenhum código gerado.</td></tr>
              ) : (
                codes.map(c => (
                  <tr key={c.id}>
                    <td style={{fontFamily: 'monospace', color: 'var(--accent)'}}>{c.code}</td>
                    <td>{c.badge_name}</td>
                    <td>{c.used_count}</td>
                    <td>{c.max_uses || 'Ilimitado'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
