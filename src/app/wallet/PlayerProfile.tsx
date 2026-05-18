'use client';

import React, { useState } from 'react';
import styles from './PlayerProfile.module.css';
import type { BadgeEntry } from './page';
import { useLanguage } from '@/lib/i18n';

interface Props {
  user: { name: string; discordName?: string; image: string | null; id: string };
  owned: BadgeEntry[];
  total: number;
}

export default function PlayerProfile({ user, owned, total }: Props) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const progress = total > 0 ? Math.round((owned.length / total) * 100) : 0;

  const RARITIES = ['Comum', 'Rara', 'Epica', 'Lendaria'];
  const RARITY_LABELS: Record<string, string> = {
    Comum: t('Common', 'Comuns'), 
    Rara: t('Rare', 'Raras'), 
    Epica: t('Epic', 'Épicas'), 
    Lendaria: t('Legendary', 'Lendárias'),
  };

  const rarityCounts = RARITIES.reduce((acc, r) => {
    acc[r] = owned.filter(b =>
      b.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
      r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    ).length;
    return acc;
  }, {} as Record<string, number>);

  const handleShare = async () => {
    const url = `${window.location.origin}/perfil/${user.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for browsers without clipboard API
      window.prompt(t('Copy your collection link:', 'Copie o link da sua coleção:'), url);
    }
  };

  const displayName = user.name === 'Adventurer' ? t('Adventurer', 'Aventureiro') : user.name;

  // Show discord name as subtitle only if display_name was set (they differ)
  const hasCustomName = user.discordName && user.discordName !== displayName;

  return (
    <div className={styles.profileCard}>
      <div className={styles.left}>
        <div className={styles.avatarWrapper}>
          {user.image ? (
            <img src={user.image} alt={displayName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{displayName[0] || 'U'}</div>
          )}
        </div>
        <div className={styles.userInfo}>
          <h2 className={styles.username}>{displayName}</h2>
          {hasCustomName && (
            <p className={styles.discordSub}>@{user.discordName}</p>
          )}
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
          <span className={styles.progressText}>{t('Collection', 'Coleção')}</span>
          <span className={styles.progressCount}>{owned.length} / {total}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={styles.progressHint}>
          {progress}% {t('of ecosystem badges collected', 'das insígnias do ecossistema coletadas')}
        </p>

        {/* Share button */}
        <button
          onClick={handleShare}
          className={styles.shareBtn}
          title={t('Copy link to your collection', 'Copiar link da sua coleção')}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('Link copied!', 'Link copiado!')}
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {t('Share collection', 'Compartilhar coleção')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
