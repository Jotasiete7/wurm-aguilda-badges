'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Maximize2, X } from 'lucide-react';
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
  max_supply?: number | null;
  total_count?: number;
  serial_number?: number;
}

interface BadgeModalProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeModalProps) {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const rarityClass = badge.rarity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as string;

  const RARITY_LABELS: Record<string, string> = {
    comum: t('Common', 'Comum'),
    Comum: t('Common', 'Comum'),
    rara: t('Rare', 'Rara'),
    Rara: t('Rare', 'Rara'),
    epica: t('Epic', 'Épica'),
    Epica: t('Epic', 'Épica'),
    lendaria: t('Legendary', 'Lendária'),
    Lendaria: t('Legendary', 'Lendária'),
    legendary: t('Legendary', 'Lendária'),
  };

  const SOURCE_LABELS: Record<string, string> = {
    code: t('Redemption Code', 'Código de Resgate'),
    manual: t('Guild Assignment', 'Atribuição da Guilda'),
    event: t('Event', 'Evento'),
  };

  const formattedDate = badge.date_earned ? new Date(badge.date_earned).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) : t('Unknown', 'Desconhecido');

  const isGhost = badge.owned === false;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(true);
  };

  return (
    <>
      <div
        className={`${styles.badgeCard} ${styles[`rarity-${rarityClass}`]} ${isGhost ? styles.ghostCard : ''}`}
        data-date-earned={badge.owned ? formattedDate : undefined}
        onClick={() => !isGhost && setIsOpen(true)}
        role="button"
        tabIndex={isGhost ? -1 : 0}
        onKeyDown={(e) => !isGhost && e.key === 'Enter' && setIsOpen(true)}
      >
        <div className={styles.imageContainer}>
          <img
            src={badge.image_url}
            alt={isGhost ? t('Locked', 'Bloqueada') : badge.name}
            className={`${styles.badgeImage} ${isGhost ? styles.ghostImage : ''} select-none`}
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23222"/><text x="60" y="65" text-anchor="middle" font-size="40">🏅</text></svg>`;
            }}
          />
          {!isGhost && (
            <div className={styles.supplyLabel}>
              {badge.serial_number ? `#${badge.serial_number}` : (badge.total_count ?? 0)}/{badge.max_supply ? badge.max_supply : '∞'}
            </div>
          )}
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
                className={`${styles.modalImage} select-none`}
                loading="lazy"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23222"/><text x="100" y="110" text-anchor="middle" font-size="60">🏅</text></svg>`;
                }}
              />
              <button 
                className={styles.zoomTrigger} 
                onClick={handleImageClick}
                title={t('View full size', 'Ver tamanho real')}
              >
                <Maximize2 size={16} />
              </button>
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
                  <span className={styles.metaLabel}>{t('Category', 'Categoria')}</span>
                  <span className={styles.metaValue}>{badge.category}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('Earned on', 'Obtida em')}</span>
                  <span className={styles.metaValue}>{formattedDate}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('Source', 'Origem')}</span>
                  <span className={styles.metaValue}>{badge.source ? (SOURCE_LABELS[badge.source] || badge.source) : t('Unknown', 'Desconhecido')}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('Supply', 'Tiragem')}</span>
                  <span className={styles.metaValue} style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {badge.serial_number ? `#${badge.serial_number}` : (badge.total_count ?? 0)} / {badge.max_supply ? badge.max_supply : '∞'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isZoomed && (
        <div className={styles.zoomOverlay} onClick={() => setIsZoomed(false)}>
          <button className={styles.zoomClose} onClick={() => setIsZoomed(false)}>
            <X size={24} />
          </button>
          <img 
            src={badge.image_url} 
            alt={badge.name} 
            className={`${styles.zoomedImage} select-none`}
            loading="lazy"
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            draggable={false}
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}
