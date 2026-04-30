'use client';

import React, { useState, useMemo } from 'react';
import BadgeCard from '@/components/BadgeCard';
import styles from './WalletGrid.module.css';
import type { BadgeEntry } from './page';
import { useLanguage } from '@/lib/i18n';

interface Props {
  badges: BadgeEntry[];
}

export default function WalletGrid({ badges }: Props) {
  const { t } = useLanguage();
  const [rarityFilter, setRarityFilter] = useState<string>('Todas');
  const [showGhosts, setShowGhosts] = useState(true);

  const RARITIES = ['Todas', 'Comum', 'Rara', 'Epica', 'Lendaria'] as const;
  const RARITY_LABELS: Record<string, string> = {
    Todas: t('All', 'Todas'), 
    Comum: t('Common', 'Comum'), 
    Rara: t('Rare', 'Rara'), 
    Epica: t('Epic', 'Épica'), 
    Lendaria: t('Legendary', 'Lendária'),
  };

  const filtered = useMemo(() => {
    return badges.filter(b => {
      if (!showGhosts && !b.owned) return false;
      if (rarityFilter === 'Todas') return true;
      return b.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
        rarityFilter.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    });
  }, [badges, rarityFilter, showGhosts]);

  const ownedCount = filtered.filter(b => b.owned).length;
  const ghostCount = filtered.filter(b => !b.owned).length;

  if (badges.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🎒</span>
        <h2>{t('No badges registered', 'Nenhuma insígnia cadastrada')}</h2>
        <p>{t('Wait for the Guild Master to forge the first badges.', 'Aguarde o Mestre da Guilda forjar as primeiras insígnias.')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          {RARITIES.map(r => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`${styles.chip} ${rarityFilter === r ? styles.chipActive : ''} ${r !== 'Todas' ? styles[`chip-${r.toLowerCase()}`] : ''}`}
            >
              {RARITY_LABELS[r]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGhosts(v => !v)}
          className={`${styles.ghostToggle} ${showGhosts ? styles.ghostToggleActive : ''}`}
        >
          {showGhosts ? t('🔒 Hide locked', '🔒 Ocultar bloqueadas') : t('🔒 Show locked', '🔒 Mostrar bloqueadas')}
        </button>
      </div>

      {/* Count line */}
      <p className={styles.countLine}>
        {ownedCount > 0 && <span>{ownedCount} {ownedCount === 1 ? t('collected', 'coletada') : t('collected', 'coletadas')}</span>}
        {ghostCount > 0 && showGhosts && <span className={styles.ghostCount}> · {ghostCount} {ghostCount === 1 ? t('locked', 'bloqueada') : t('locked', 'bloqueadas')}</span>}
      </p>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map((badge, i) => (
          <div
            key={badge.id}
            className={styles.cardWrapper}
            style={{ '--delay': i } as React.CSSProperties}
          >
            <BadgeCard badge={badge} />
          </div>
        ))}
      </div>
    </div>
  );
}
