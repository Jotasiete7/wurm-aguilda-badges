import React from 'react';
import db from '@/lib/db';
import Header from '@/components/Header';
import PlayerProfile from '@/app/wallet/PlayerProfile';
import WalletGrid from '@/app/wallet/WalletGrid';
import { notFound } from 'next/navigation';
import type { BadgeEntry } from '@/app/wallet/page';
import { T } from '@/lib/i18n';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  // 1. Check if user exists
  const { data: user } = await db.from('users').select('*').eq('id', id).single();

  if (!user) {
    notFound();
  }

  // 2. Fetch all badges and user badges in parallel
  const [{ data: userBadgesRaw }, { data: badgesRaw }, { count: total }] = await Promise.all([
    db.from('user_badges').select('*').eq('user_id', id),
    db.from('badges').select('*'),
    db.from('badges').select('id', { count: 'exact', head: true }),
  ]);

  // Fetch claim timestamps for all owned badges in a single query
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

  // Convert to expected format and calculate serial numbers in memory
  const badges: BadgeEntry[] = (userBadgesRaw || []).map((ub: any) => {
    const b = badgesRaw?.find(badge => badge.id === ub.badge_id);
    if (!b) return null;

    const ubTime = new Date(ub.created_at).getTime();
    const count = claimTimestamps.filter(
      (c: any) => c.badge_id === ub.badge_id && new Date(c.created_at).getTime() <= ubTime
    ).length;

    return {
      ...b,
      date_earned: ub.date_earned,
      source: ub.source,
      owned: true,
      serial_number: count || 1,
    };
  }).filter((b): b is BadgeEntry => b !== null);

  const sortedBadges = badges.sort((a, b) => a.name.localeCompare(b.name));

  const profileUser = {
    name: user.username,
    image: user.avatar,
    id: user.id,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main className="container" style={{ padding: '2rem 1rem', flex: 1 }}>
        <PlayerProfile user={profileUser} owned={badges} total={total} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>
              <T en="Collection of" pt="Coleção de" /> <strong>{user.username}</strong>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {badges.length} <T en={badges.length === 1 ? 'badge collected' : 'badges collected'} pt={badges.length === 1 ? 'insígnia coletada' : 'insígnias coletadas'} />
            </p>
          </div>
        </div>

        <WalletGrid badges={badges} />
      </main>
    </div>
  );
}
