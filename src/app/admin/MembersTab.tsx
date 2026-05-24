'use client';

import { useState } from 'react';
import AdminForm from './AdminForm';
import { updateDisplayName, toggleAdmin } from './actions';
import styles from './admin.module.css';

interface Member {
  discord_id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  badge_count: number;
  is_admin: boolean;
}

export default function MembersTab({ members }: { members: Member[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(m => {
    const query = searchQuery.toLowerCase();
    const nameMatch = m.username.toLowerCase().includes(query) || 
                      (m.display_name && m.display_name.toLowerCase().includes(query));
    return nameMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="Buscar por nome ou discord..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        <div className={styles.membersList}>
          {filteredMembers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Nenhum membro encontrado.
            </p>
      ) : (
        filteredMembers.map((m) => (
          <div key={m.discord_id} className={styles.memberCard}>
            {/* Avatar + Info */}
            <div className={styles.memberInfo}>
              {m.avatar ? (
                <img src={m.avatar} alt={m.username} className={styles.memberAvatar} />
              ) : (
                <div className={styles.memberAvatarPlaceholder}>?</div>
              )}
              <div>
                <p className={styles.memberName}>
                  {m.display_name || m.username}
                  {m.is_admin && <span className={styles.adminBadge}>Admin</span>}
                </p>
                <p className={styles.memberSub}>
                  Discord: {m.username} · {m.badge_count} insígnia{m.badge_count !== 1 ? 's' : ''}
                </p>
                <p className={styles.memberSub} style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                  ID: {m.discord_id}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.memberActions}>
              {editingId === m.discord_id ? (
                <AdminForm
                  action={updateDisplayName}
                  submitLabel="Salvar"
                  onSuccess={() => setEditingId(null)}
                >
                  <input type="hidden" name="discord_id" value={m.discord_id} />
                  <input
                    type="text"
                    name="display_name"
                    className="input"
                    defaultValue={m.display_name || ''}
                    placeholder="Nick da Guilda (vazio = usar Discord)"
                    maxLength={40}
                    style={{ minWidth: 220 }}
                    autoFocus
                  />
                </AdminForm>
              ) : (
                <button
                  className="btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => setEditingId(m.discord_id)}
                >
                  ✏ Nick
                </button>
              )}

              {/* Toggle Admin */}
              <AdminForm
                action={toggleAdmin}
                submitLabel={m.is_admin ? '— Remover Admin' : '⚔ Dar Admin'}
                variant={m.is_admin ? 'danger' : 'default'}
              >
                <input type="hidden" name="discord_id" value={m.discord_id} />
                <input type="hidden" name="action" value={m.is_admin ? 'remove' : 'add'} />
              </AdminForm>
            </div>
          </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
