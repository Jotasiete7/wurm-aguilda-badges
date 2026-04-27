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
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as { id: string; username: string; avatar: string | null } | undefined;

  if (!user) {
    notFound();
  }

  // 2. Fetch all badges owned by the user
  const ownedBadges = db.prepare(`
    SELECT
      badges.*,
      user_badges.date_earned,
      user_badges.source,
      1 as owned
    FROM badges
    INNER JOIN user_badges
      ON badges.id = user_badges.badge_id
      AND user_badges.user_id = ?
    ORDER BY badges.rarity, badges.name
  `).all(id) as (BadgeEntry & { owned: 1 })[];

  // Convert to boolean for components
  const badges: BadgeEntry[] = ownedBadges.map(b => ({ ...b, owned: true }));
  
  // 3. Get total ecosystem badges for progress
  const total = (db.prepare('SELECT COUNT(*) as count FROM badges').get() as { count: number }).count;

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
