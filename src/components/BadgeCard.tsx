'use client';

import React, { useState } from 'react';
import styles from './BadgeModal.module.css';

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  rarity: string;
  date_earned: string | null;
  source: string | null;
  owned?: boolean;
}

interface BadgeModalProps {
  badge: Badge;
}

const RARITY_LABELS: Record<string, string> = {
  comum: 'Comum',
  Comum: 'Comum',
  rara: 'Rara',
  Rara: 'Rara',
  epica: 'Épica',
  Epica: 'Épica',
  lendaria: 'Lendária',
  Lendaria: 'Lendária',
  legendary: 'Lendária',
};

const SOURCE_LABELS: Record<string, string> = {
  code: 'Código de Resgate',
  manual: 'Atribuição da Guilda',
  event: 'Evento',
};

export default function BadgeCard({ badge }: BadgeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rarityClass = badge.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as string;

  const formattedDate = badge.date_earned ? new Date(badge.date_earned).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : 'Desconhecido';

  const isGhost = badge.owned === false;

  return (
    <>
      <div
        className={`${styles.badgeCard} ${styles[`rarity-${rarityClass}`]} ${isGhost ? styles.ghostCard : ''}`}
        onClick={() => !isGhost && setIsOpen(true)}
        role="button"
        tabIndex={isGhost ? -1 : 0}
        onKeyDown={(e) => !isGhost && e.key === 'Enter' && setIsOpen(true)}
      >
        <div className={styles.imageContainer}>
          <img
            src={badge.image_url}
            alt={isGhost ? 'Bloqueada' : badge.name}
            className={`${styles.badgeImage} ${isGhost ? styles.ghostImage : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23222"/><text x="60" y="65" text-anchor="middle" font-size="40">🏅</text></svg>`;
            }}
          />
          {isGhost && <div className={styles.lockIcon}>🔒</div>}
        </div>
        <div className={styles.badgeInfo}>
          <h3 className={styles.badgeName}>{isGhost ? '???' : badge.name}</h3>
          <div className={styles.badgeMeta}>
            <span className={styles.badgeCategory}>{badge.category}</span>
            <span className={`${styles.rarityTag} ${styles[`rarityTag-${rarityClass}`]} ${isGhost ? styles.ghostTag : ''}`}>
              {RARITY_LABELS[badge.rarity] || badge.rarity}
            </span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div
            className={`${styles.modal} ${styles[`modal-${rarityClass}`]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>

            <div className={styles.modalImageWrapper}>
              <img
                src={badge.image_url}
                alt={badge.name}
                className={styles.modalImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23222"/><text x="100" y="110" text-anchor="middle" font-size="60">🏅</text></svg>`;
                }}
              />
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalName}>{badge.name}</h2>
                <span className={`${styles.rarityTag} ${styles[`rarityTag-${rarityClass}`]}`}>
                  {RARITY_LABELS[badge.rarity] || badge.rarity}
                </span>
              </div>

              {badge.description && (
                <p className={styles.modalDesc}>{badge.description}</p>
              )}

              <div className={styles.modalMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Categoria</span>
                  <span className={styles.metaValue}>{badge.category}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Obtida em</span>
                  <span className={styles.metaValue}>{formattedDate}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Origem</span>
                  <span className={styles.metaValue}>{badge.source ? (SOURCE_LABELS[badge.source] || badge.source) : 'Desconhecido'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
