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
  serial_number?: number;
  max_supply?: number | null;
}

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const userId = session.user.id;

  // All badges in the system + user's own badges
  const { data: badgesRaw } = await db.from('badges').select('*');
  const { data: userBadgesRaw } = await db.from('user_badges').select('*').eq('user_id', userId);

  // To calculate the "Serial Number" (rank) for each badge the user owns
  // We fetch the claim counts per badge up to the user's claim date
  const badges: BadgeEntry[] = await Promise.all((badgesRaw || []).map(async (b: any) => {
    const ub = userBadgesRaw?.find((u: any) => u.badge_id === b.id);
    
    let serialNumber = undefined;
    if (ub) {
      // Count how many people claimed this badge on or before the user did
      const { count } = await db
        .from('user_badges')
        .select('id', { count: 'exact', head: true })
        .eq('badge_id', b.id)
        .lte('created_at', ub.created_at);
      serialNumber = count || 1;
    }

    return {
      ...b,
      date_earned: ub ? ub.date_earned : null,
      source: ub ? ub.source : null,
      owned: !!ub,
      serial_number: serialNumber,
    };
  }));

  const sortedBadges = badges.sort((a, b) => {
    if (a.owned && !b.owned) return -1;
    if (!a.owned && b.owned) return 1;
    return a.name.localeCompare(b.name);
  });

  const owned = sortedBadges.filter(b => b.owned);
  const total = sortedBadges.length;

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
