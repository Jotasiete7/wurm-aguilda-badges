import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import { generateSecureCode } from '@/lib/utils';
import styles from './admin.module.css';
import AdminForm from './AdminForm';
import ImagePreviewInput from './ImagePreviewInput';
import MembersTab from './MembersTab';
import { createBadge, createCode, assignBadgeManually, revokeBadgeManually, manageBadgeManually } from './actions';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const { data: adminRow } = await db.from('admins').select('id').eq('discord_id', session.user.id).single();
  const isAdmin = !!adminRow;
  if (!isAdmin) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <main className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h1>Acesso Negado</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Você não possui privilégios da Guilda para acessar esta área.</p>
        </main>
      </div>
    );
  }

  const { data: badges } = await db.from('badges').select('*').order('created_at', { ascending: false });
  
  const { data: codesRaw } = await db.from('codes').select('*, badges(name)').order('created_at', { ascending: false });
  const codes = codesRaw?.map((c: any) => ({ ...c, badge_name: c.badges?.name })) || [];

  const { data: badgeStatsRaw } = await db.from('badges').select('id, name, rarity, max_supply, user_badges(id)');
  const badgeStats = badgeStatsRaw?.map((b: any) => ({
    id: b.id, name: b.name, rarity: b.rarity, max_supply: b.max_supply, total: b.user_badges?.length || 0
  })).sort((a, b) => b.total - a.total) || [];

  // Fetch all members + admin status for the Members tab
  const { data: allAdmins } = await db.from('admins').select('discord_id');
  const adminIds = new Set((allAdmins || []).map((a: any) => a.discord_id));
  const { data: allUsersRaw } = await db.from('users').select('discord_id, username, display_name, avatar, user_badges(id)').order('username');
  const allMembers = (allUsersRaw || []).map((u: any) => ({
    discord_id: u.discord_id,
    username: u.username,
    display_name: u.display_name || null,
    avatar: u.avatar,
    badge_count: u.user_badges?.length || 0,
    is_admin: adminIds.has(u.discord_id),
  }));

  // Fetch redemption history
  const { data: historyRaw } = await db.from('code_redemptions')
    .select(`
      id,
      redeemed_at,
      codes ( code, badges ( name ) ),
      users ( username, display_name, avatar )
    `)
    .order('redeemed_at', { ascending: false })
    .limit(50);

  const history = historyRaw?.map((h: any) => ({
    id: h.id,
    redeemed_at: h.redeemed_at,
    code: h.codes?.code,
    badge_name: h.codes?.badges?.name,
    username: h.users?.username,
    display_name: h.users?.display_name,
    avatar: h.users?.avatar
  })) || [];

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <h1 className={styles.title}>Painel da Guilda</h1>

        {/* ── MÉTRICAS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 Métricas dos Emblemas</h2>
          {badgeStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Ainda sem dados.</p>
          ) : (
            <div className={styles.statsGrid}>
              {badgeStats.map((b: any) => (
                <div key={b.id} className={styles.statsRow}>
                  <div className={styles.statsBadgeInfo}>
                    <span className={styles.statsBadgeName}>{b.name}</span>
                    <span className={styles.statsBadgeRarity}>{b.rarity}</span>
                  </div>
                  <div className={styles.statsCount}>
                    {b.total} <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>resgates</span>
                  </div>
                  <div className={styles.statsSupply}>
                    <span className={styles.statsSupplyText}>Tiragem: {b.max_supply ? b.max_supply : '∞'}</span>
                    {b.max_supply && (
                      <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: 'var(--accent)', width: `${Math.min((b.total / b.max_supply) * 100, 100)}%` }}></div>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <a href={`/admin/badges/${b.id}`} className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      ✏ Editar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SEÇÃO DE CONTROLES (GRID LADO A LADO) ── */}
        <div className={styles.grid}>
          {/* ── CRIAR INSÍGNIA ── */}
          <section className={styles.section} style={{ marginBottom: 0 }}>
            <h2 className={styles.sectionTitle}>⚔ Forjar Nova Insígnia</h2>
            <div className="card">
              <AdminForm action={createBadge} submitLabel="Forjar Insígnia">
                <div className={styles.formGroup}>
                  <label>Nome</label>
                  <input type="text" name="name" className="input" required maxLength={80} />
                </div>
                <div className={styles.formGroup}>
                  <label>Descrição</label>
                  <textarea name="description" className={`input ${styles.textarea}`} rows={3} maxLength={500} />
                </div>
                <ImagePreviewInput />
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
                  <div className={styles.formGroup}>
                    <label>Tiragem Máxima (vazio = ∞)</label>
                    <input type="number" name="max_supply" className="input" min="1" placeholder="Ex: 50" />
                  </div>
                </div>
              </AdminForm>
            </div>
          </section>

          {/* ── GERAR CÓDIGO ── */}
          <section className={styles.section} style={{ marginBottom: 0 }}>
            <h2 className={styles.sectionTitle}>🔑 Gerar Código de Resgate</h2>
            <div className="card">
              <AdminForm action={createCode} submitLabel="Gerar Código">
                <div className={styles.formGroup}>
                  <label>Insígnia</label>
                  <select name="badge_id" className="input" required>
                    {!badges || badges.length === 0 && <option value="">Nenhuma insígnia forjada</option>}
                    {badges?.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Código de Resgate (Sugerido)</label>
                  <input type="text" name="code" className="input" required minLength={3} maxLength={40}
                    defaultValue={generateSecureCode(12)}
                    style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
                  <p className={styles.hint}>Dica: Use o código seguro gerado acima ou defina um padrão difícil de adivinhar.</p>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Limite de Usos (vazio = ilimitado)</label>
                    <input type="number" name="max_uses" className="input" min="1" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Expiração (opcional)</label>
                    <input type="datetime-local" name="expires_at" className="input" />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Nota Interna (Opcional - Ex: Evento de Construção)</label>
                  <input type="text" name="note" className="input" placeholder="Para controle interno dos admins" />
                </div>
              </AdminForm>
            </div>
          </section>

          {/* ── GERENCIAMENTO MANUAL DE INSÍGNIAS ── */}
          <section className={styles.section} style={{ marginBottom: 0 }}>
            <h2 className={styles.sectionTitle}>🎖 Gerenciar Insígnia do Membro</h2>
            <div className="card">
              <AdminForm action={manageBadgeManually} submitLabel="Executar Ação" variant="accent">
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ação</label>
                    <select name="operation" className="input" required>
                      <option value="grant">➕ Conceder Insígnia</option>
                      <option value="revoke">🗑 Remover Insígnia</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Insígnia</label>
                    <select name="badge_id" className="input" required>
                      {badges?.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Membro</label>
                  <select name="discord_id" className="input" required>
                    <option value="">Selecione um membro...</option>
                    {allMembers.map((m: any) => (
                      <option key={m.discord_id} value={m.discord_id}>
                        {m.display_name ? `${m.display_name} (@${m.username})` : m.username}
                      </option>
                    ))}
                  </select>
                </div>
              </AdminForm>
            </div>
          </section>
        </div>

        {/* ── TABELA DE CÓDIGOS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Códigos Ativos</h2>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table className={styles.table}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th>Código</th>
                  <th>Insígnia</th>
                  <th>Usos</th>
                  <th>Limite</th>
                  <th>Expira em</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', opacity: 0.5 }}>Nenhum código gerado.</td></tr>
                ) : (
                  codes.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)', letterSpacing: 1 }}>{c.code}</td>
                      <td>{c.badge_name}</td>
                      <td>{c.used_count}</td>
                      <td>{c.max_uses ?? '∞'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.note}>
                        {c.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── HISTÓRICO DE RESGATES ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📜 Histórico de Resgates</h2>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table className={styles.table}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th>Membro</th>
                  <th>Código</th>
                  <th>Insígnia</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>Nenhum resgate registrado ainda.</td></tr>
                ) : (
                  history.map((h: any) => (
                    <tr key={h.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {h.avatar ? (
                          <img src={h.avatar} alt={h.username} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--bg-card)' }} />
                        )}
                        <span>{h.display_name || h.username} <span style={{ opacity: 0.5, fontSize: '0.85em' }}>@{h.username}</span></span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)', letterSpacing: 1 }}>{h.code || '—'}</td>
                      <td>{h.badge_name || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {h.redeemed_at ? new Date(h.redeemed_at).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── MEMBROS ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>👥 Gerenciar Membros</h2>
          <MembersTab members={allMembers} />
        </section>

      </main>
    </div>
  );
}
