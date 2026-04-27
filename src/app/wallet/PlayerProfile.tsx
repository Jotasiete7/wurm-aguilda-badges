import React from 'react';
import styles from './PlayerProfile.module.css';
import type { BadgeEntry } from './page';

const RARITIES = ['Comum', 'Rara', 'Epica', 'Lendaria'];
const RARITY_LABELS: Record<string, string> = {
  Comum: 'Comuns', Rara: 'Raras', Epica: 'Épicas', Lendaria: 'Lendárias',
};

function getTitle(count: number): string {
  if (count === 0) return 'Recruta';
  if (count <= 2) return 'Aprendiz';
  if (count <= 5) return 'Veterano';
  if (count <= 10) return 'Guardião';
  return 'Lendário';
}

interface Props {
  user: { name: string; image: string | null; id: string };
  owned: BadgeEntry[];
  total: number;
}

export default function PlayerProfile({ user, owned, total }: Props) {
  const title = getTitle(owned.length);
  const progress = total > 0 ? Math.round((owned.length / total) * 100) : 0;

  const rarityCounts = RARITIES.reduce((acc, r) => {
    acc[r] = owned.filter(b =>
      b.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
      r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.profileCard}>
      <div className={styles.left}>
        <div className={styles.avatarWrapper}>
          {user.image ? (
            <img src={user.image} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{user.name[0]}</div>
          )}
          <div className={styles.titleBadge}>{title}</div>
        </div>
        <div className={styles.userInfo}>
          <h2 className={styles.username}>{user.name}</h2>
          <div className={styles.rarityBreakdown}>
            {RARITIES.map(r => (
              <span key={r} className={`${styles.rarityPill} ${styles[`rarity-${r.toLowerCase()}`]}`}>
                {rarityCounts[r]} {RARITY_LABELS[r]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.progressLabel}>
          <span className={styles.progressText}>Coleção</span>
          <span className={styles.progressCount}>{owned.length} / {total}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={styles.progressHint}>
          {progress}% das insígnias do ecossistema coletadas
        </p>
      </div>
    </div>
  );
}
