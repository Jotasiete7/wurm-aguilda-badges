import React from 'react';
import db from '@/lib/db';
import Header from '@/components/Header';
import PlayerProfile from '@/app/wallet/PlayerProfile';
import WalletGrid from '@/app/wallet/WalletGrid';
import { notFound } from 'next/navigation';
import type { BadgeEntry } from '@/app/wallet/page';

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

  // 2. Fetch all badges owned by the user
  const { data: userBadgesRaw } = await db.from('user_badges').select('*').eq('user_id', id);
  const { data: badgesRaw } = await db.from('badges').select('*');

  // Convert to expected format and calculate serial numbers
  const badges: BadgeEntry[] = await Promise.all((userBadgesRaw || []).map(async (ub: any) => {
    const b = badgesRaw?.find(badge => badge.id === ub.badge_id);
    
    // Count how many people claimed this badge on or before the user did
    const { count } = await db
      .from('user_badges')
      .select('id', { count: 'exact', head: true })
      .eq('badge_id', ub.badge_id)
      .lte('created_at', ub.created_at);

    return {
      ...b,
      date_earned: ub.date_earned,
      source: ub.source,
      owned: true,
      serial_number: count || 1,
    };
  }));

  const sortedBadges = badges.sort((a, b) => a.name.localeCompare(b.name));
  
  // 3. Get total ecosystem badges for progress
  const { count: total } = await db.from('badges').select('id', { count: 'exact', head: true });

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
              Coleção de <strong>{user.username}</strong>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {badges.length} {badges.length === 1 ? 'insígnia coletada' : 'insígnias coletadas'}
            </p>
          </div>
        </div>

        <WalletGrid badges={badges} />
      </main>
    </div>
  );
}
