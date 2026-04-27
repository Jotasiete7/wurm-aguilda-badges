import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import PlayerProfile from './PlayerProfile';
import WalletGrid from './WalletGrid';
import RedeemForm from './RedeemForm';
import styles from './wallet.module.css';

export interface BadgeEntry {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  rarity: string;
  date_earned: string | null;
  source: string | null;
  owned: boolean;
}

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const userId = session.user.id;

  // All badges in the system with owned status for this user
  const allBadges = db.prepare(`
    SELECT
      badges.*,
      user_badges.date_earned,
      user_badges.source,
      CASE WHEN user_badges.id IS NOT NULL THEN 1 ELSE 0 END as owned
    FROM badges
    LEFT JOIN user_badges
      ON badges.id = user_badges.badge_id
      AND user_badges.user_id = ?
    ORDER BY owned DESC, badges.rarity, badges.name
  `).all(userId) as (BadgeEntry & { owned: 0 | 1 })[];

  const badges: BadgeEntry[] = allBadges.map(b => ({ ...b, owned: b.owned === 1 }));
  const owned = badges.filter(b => b.owned);
  const total = badges.length;

  const user = {
    name: session.user.name || 'Aventureiro',
    image: session.user.image || null,
    id: userId,
  };

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <PlayerProfile user={user} owned={owned} total={total} />

        <div className={styles.walletHeader}>
          <div>
            <h1 className={styles.title}>Meu <strong>Inventário</strong></h1>
            <p className={styles.subtitle}>
              {owned.length} {owned.length === 1 ? 'insígnia coletada' : 'insígnias coletadas'}
            </p>
          </div>
          <RedeemForm />
        </div>

        <WalletGrid badges={badges} />
      </main>
    </div>
  );
}
