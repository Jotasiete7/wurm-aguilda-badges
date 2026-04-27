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
  const { data: badgesRaw } = await db.from('badges').select('*');
  const { data: userBadgesRaw } = await db.from('user_badges').select('*').eq('user_id', userId);

  const badges: BadgeEntry[] = (badgesRaw || []).map((b: any) => {
    const ub = userBadgesRaw?.find((u: any) => u.badge_id === b.id);
    return {
      ...b,
      date_earned: ub ? ub.date_earned : null,
      source: ub ? ub.source : null,
      owned: !!ub,
    };
  }).sort((a, b) => {
    if (a.owned && !b.owned) return -1;
    if (!a.owned && b.owned) return 1;
    return a.name.localeCompare(b.name);
  });
  const owned = badges.filter(b => b.owned);
  const total = badges.length;

  // Fetch display_name from DB (may differ from Discord username)
  const { data: dbUser } = await db.from('users').select('display_name, username').eq('id', userId).single();

  const user = {
    name: dbUser?.display_name || dbUser?.username || session.user.name || 'Aventureiro',
    discordName: session.user.name || '',
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
