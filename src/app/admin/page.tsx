import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import styles from './admin.module.css';
import { createBadge, createCode, assignBadgeManually, updateBadge } from './actions';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const isAdmin = db.prepare('SELECT id FROM admins WHERE discord_id = ?').get(session.user.id);
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

  const badges = db.prepare('SELECT * FROM badges ORDER BY created_at DESC').all() as any[];
  const codes = db.prepare('SELECT codes.*, badges.name as badge_name FROM codes JOIN badges ON codes.badge_id = badges.id ORDER BY codes.created_at DESC').all() as any[];

  // Stats: resgates por badge
  const badgeStats = db.prepare(`
    SELECT badges.id, badges.name, badges.rarity, COUNT(user_badges.id) as total
    FROM badges
    LEFT JOIN user_badges ON badges.id = user_badges.badge_id
    GROUP BY badges.id
    ORDER BY total DESC
  `).all() as any[];

  // Ranking: top colecionadores
  const ranking = db.prepare(`
    SELECT users.username, users.avatar, COUNT(user_badges.id) as total
    FROM users
    JOIN user_badges ON users.id = user_badges.user_id
    GROUP BY users.id
    ORDER BY total DESC
    LIMIT 10
  `).all() as any[];

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <h1 className={styles.title}>Painel da Guilda</h1>

        {/* ── STATS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 Métricas dos Emblemas</h2>
          <div className={styles.statsGrid}>
            {badgeStats.map((b: any) => (
              <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{b.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{b.rarity}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{b.total}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>resgates</p>
                </div>
              </div>
            ))}
            {badgeStats.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Ainda sem resgates.</p>}
          </div>
        </section>

        {/* ── RANKING ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏆 Ranking de Colecionadores</h2>
          <div className={styles.rankingList}>
            {ranking.map((u: any, i: number) => (
              <div key={u.username} className={styles.rankItem}>
                <span className={styles.rankPos}>#{i + 1}</span>
                {u.avatar && (
                  <img src={u.avatar} alt={u.username} className={styles.rankAvatar}
                    onError={() => {}} />
                )}
                <span className={styles.rankName}>{u.username}</span>
                <span className={styles.rankCount}>{u.total} emblema{u.total !== 1 ? 's' : ''}</span>
              </div>
            ))}
            {ranking.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Ainda sem dados de ranking.</p>}
          </div>
        </section>

        {/* ── CRIAR / EDITAR BADGE ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚔ Gerenciar Insígnias</h2>
          <div className={styles.grid}>
            {/* Criar */}
            <div className="card">
              <h3>Forjar Nova Insígnia</h3>
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
                  <label>URL da Imagem</label>
                  <input type="text" name="image_url" className="input" required />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Categoria</label>
                    <select name="category" className="input" required>
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
                    <select name="rarity" className="input" required>
                      <option value="Comum">Comum</option>
                      <option value="Rara">Rara</option>
                      <option value="Epica">Épica</option>
                      <option value="Lendaria">Lendária</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Forjar Insígnia</button>
              </form>
            </div>

            {/* Editar Badges existentes */}
            <div className="card">
              <h3>Editar Insígnia Existente</h3>
              {badges.length === 0 ? (
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Nenhuma insígnia forjada ainda.</p>
              ) : (
                <div className={styles.editList}>
                  {badges.map((b: any) => (
                    <details key={b.id} className={styles.editDetails}>
                      <summary className={styles.editSummary}>
                        <span>{b.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.rarity}</span>
                      </summary>
                      <form action={updateBadge} className={styles.form} style={{ marginTop: '1rem' }}>
                        <input type="hidden" name="id" value={b.id} />
                        <div className={styles.formGroup}>
                          <label>Nome</label>
                          <input type="text" name="name" defaultValue={b.name} className="input" required />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Descrição</label>
                          <input type="text" name="description" defaultValue={b.description || ''} className="input" />
                        </div>
                        <div className={styles.formGroup}>
                          <label>URL da Imagem</label>
                          <input type="text" name="image_url" defaultValue={b.image_url} className="input" required />
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Categoria</label>
                            <select name="category" className="input" defaultValue={b.category}>
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
                            <select name="rarity" className="input" defaultValue={b.rarity}>
                              <option value="Comum">Comum</option>
                              <option value="Rara">Rara</option>
                              <option value="Epica">Épica</option>
                              <option value="Lendaria">Lendária</option>
                            </select>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>Salvar Alterações</button>
                      </form>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── CÓDIGOS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔑 Gerar e Atribuir</h2>
          <div className={styles.grid}>
            <div className="card">
              <h3>Gerar Código de Resgate</h3>
              <form action={createCode} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Selecionar Insígnia</label>
                  <select name="badge_id" className="input" required>
                    {badges.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                    {badges.length === 0 && <option value="">Nenhuma insígnia forjada</option>}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Código (Ex: GUILDA-2024)</label>
                  <input type="text" name="code" className="input" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Limite de Usos (Vazio = Ilimitado)</label>
                  <input type="number" name="max_uses" className="input" min="1" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Gerar Código</button>
              </form>
            </div>

            <div className="card">
              <h3>Atribuir Manualmente</h3>
              <form action={assignBadgeManually} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Selecionar Insígnia</label>
                  <select name="badge_id" className="input" required>
                    {badges.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Discord ID do Membro</label>
                  <input type="text" name="discord_id" className="input" required />
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>Conceder</button>
              </form>
            </div>
          </div>
        </section>

        {/* ── TABELA DE CÓDIGOS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Códigos Ativos</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Insígnia</th>
                  <th>Usos</th>
                  <th>Limite</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>Nenhum código gerado.</td></tr>
                ) : (
                  codes.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{c.code}</td>
                      <td>{c.badge_name}</td>
                      <td>{c.used_count}</td>
                      <td>{c.max_uses ?? 'Ilimitado'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
