import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import BadgeCard from '@/components/BadgeCard';
import RedeemForm from './RedeemForm';
import styles from './wallet.module.css';

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  rarity: string;
  date_earned: string;
  source: string;
}

export default async function WalletPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  const stmt = db.prepare(`
    SELECT badges.*, user_badges.date_earned, user_badges.source
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
          <div>
            <h1 className={styles.title}>Meu Inventário</h1>
            <p className={styles.subtitle}>
              {userBadges.length} {userBadges.length === 1 ? 'Insígnia' : 'Insígnias'} coletadas
            </p>
          </div>
          <RedeemForm />
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
              <BadgeCard key={`${badge.id}-${badge.date_earned}`} badge={badge} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
