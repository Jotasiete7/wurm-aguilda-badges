import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import styles from './wallet.module.css';

// Badge interface from our DB schema
interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  rarity: string;
  date_earned: string;
}

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  // Fetch the user's badges from the database using better-sqlite3
  const stmt = db.prepare(`
    SELECT badges.*, user_badges.date_earned 
    FROM user_badges 
    JOIN badges ON user_badges.badge_id = badges.id 
    WHERE user_badges.user_id = ?
    ORDER BY user_badges.date_earned DESC
  `);
  
  const userBadges = stmt.all(session.user.id) as Badge[];

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <div className={styles.walletHeader}>
          <h1 className={styles.title}>Meu Inventário</h1>
          <p className={styles.subtitle}>
            {userBadges.length} {userBadges.length === 1 ? 'Insígnia' : 'Insígnias'} coletadas
          </p>
        </div>

        {userBadges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎒</div>
            <h2>Mochila Vazia</h2>
            <p>Você ainda não coletou nenhuma insígnia. Resgate códigos para preencher seu inventário.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {userBadges.map((badge) => (
              <div 
                key={`${badge.id}-${badge.date_earned}`} 
                className={`${styles.badgeCard} ${styles[`rarity-${badge.rarity.toLowerCase()}`]}`}
              >
                <div className={styles.imageContainer}>
                  <img src={badge.image_url} alt={badge.name} className={styles.badgeImage} />
                </div>
                <div className={styles.badgeInfo}>
                  <h3 className={styles.badgeName}>{badge.name}</h3>
                  <div className={styles.badgeMeta}>
                    <span className={styles.badgeCategory}>{badge.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
