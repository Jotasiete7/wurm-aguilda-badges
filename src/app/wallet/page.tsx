import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import Header from '@/components/Header';
import PlayerProfile from './PlayerProfile';
import WalletGrid from './WalletGrid';
import RedeemForm from './RedeemForm';
import styles from './wallet.module.css';
import { T } from '@/lib/i18n';

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

  // 1. Fetch badges, user's badges, and profile data in parallel
  const [{ data: badgesRaw }, { data: userBadgesRaw }, { data: dbUser }] = await Promise.all([
    db.from('badges').select('*'),
    db.from('user_badges').select('*').eq('user_id', userId),
    db.from('users').select('display_name, username').eq('id', userId).single(),
  ]);

  // 2. Fetch timestamps for all user-owned badges in ONE single query (eliminates N+1 queries)
  const ownedBadgeIds = (userBadgesRaw || []).map((u: any) => u.badge_id);
  let claimTimestamps: { badge_id: string; created_at: string }[] = [];
  if (ownedBadgeIds.length > 0) {
    const { data: claims } = await db
      .from('user_badges')
      .select('badge_id, created_at')
      .in('badge_id', ownedBadgeIds);
    if (claims) {
      claimTimestamps = claims;
    }
  }

  // 3. Calculate serial numbers in memory (< 1ms)
  const badges: BadgeEntry[] = (badgesRaw || []).map((b: any) => {
    const ub = userBadgesRaw?.find((u: any) => u.badge_id === b.id);
    
    let serialNumber = undefined;
    if (ub) {
      const ubTime = new Date(ub.created_at).getTime();
      const count = claimTimestamps.filter(
        (c: any) => c.badge_id === b.id && new Date(c.created_at).getTime() <= ubTime
      ).length;
      serialNumber = count || 1;
    }

    return {
      ...b,
      date_earned: ub ? ub.date_earned : null,
      source: ub ? ub.source : null,
      owned: !!ub,
      serial_number: serialNumber,
    };
  });

  const sortedBadges = badges.sort((a, b) => {
    if (a.owned && !b.owned) return -1;
    if (!a.owned && b.owned) return 1;
    return a.name.localeCompare(b.name);
  });

  const owned = sortedBadges.filter(b => b.owned);
  const total = sortedBadges.length;

  const user = {
    name: dbUser?.display_name || dbUser?.username || session.user.name || 'Adventurer',
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
            <h1 className={styles.title}>
              <T en="My" pt="Meu" /> <strong><T en="Inventory" pt="Inventário" /></strong>
            </h1>
            <p className={styles.subtitle}>
              {owned.length} <T en={owned.length === 1 ? 'badge collected' : 'badges collected'} pt={owned.length === 1 ? 'insígnia coletada' : 'insígnias coletadas'} />
            </p>
          </div>
          <RedeemForm />
        </div>

        <WalletGrid badges={badges} />
      </main>
    </div>
  );
}
