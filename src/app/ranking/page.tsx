import React from 'react';
import db from '@/lib/db';
import Header from '@/components/Header';
import styles from './ranking.module.css';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function RankingPage() {
  // 1. Fetch total number of badges in the system for completion %
  const { count: totalBadgesCount } = await db.from('badges').select('id', { count: 'exact', head: true });
  const totalBadges = totalBadgesCount || 1;

  // 2. Fetch users and their badges
  // We join users -> user_badges -> badges
  const { data: usersWithBadges, error } = await db
    .from('users')
    .select(`
      id,
      username,
      display_name,
      avatar,
      user_badges (
        badge_id,
        badges (
          rarity
        )
      )
    `);

  if (error) {
    console.error("Error fetching ranking data:", error);
  }

  // 3. Process data and calculate scores
  const ranking = (usersWithBadges || [])
    .map((user: any) => {
      const badges = user.user_badges || [];
      if (badges.length === 0) return null;

      const counts = {
        Lendaria: 0,
        Epica: 0,
        Rara: 0,
        Comum: 0,
      };

      let totalScore = 0;

      badges.forEach((ub: any) => {
        const rarity = ub.badges?.rarity;
        if (rarity === 'Lendaria') {
          counts.Lendaria++;
          totalScore += 4;
        } else if (rarity === 'Epica') {
          counts.Epica++;
          totalScore += 3;
        } else if (rarity === 'Rara') {
          counts.Rara++;
          totalScore += 2;
        } else {
          counts.Comum++;
          totalScore += 1;
        }
      });

      return {
        id: user.id,
        name: user.display_name || user.username,
        avatar: user.avatar,
        counts,
        totalScore,
        badgeCount: badges.length,
        completion: Math.round((badges.length / totalBadges) * 100),
      };
    })
    .filter((u: any) => u !== null)
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.badgeCount - a.badgeCount;
    });

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className="container">
        <header className={styles.rankingHeader}>
          <h1 className={styles.title}>Hall da <strong>Fama</strong></h1>
          <p className={styles.subtitle}>Os maiores colecionadores da guilda</p>
        </header>

        <div className={styles.rankingList}>
          {ranking.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Ainda não há aventureiros no ranking.
            </div>
          ) : (
            ranking.map((user, index) => (
              <div key={user.id} className={styles.rankItem}>
                <div className={styles.rankPos}>#{index + 1}</div>
                
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=111&color=fff`} 
                  alt={user.name} 
                  className={styles.avatar} 
                />

                <div className={styles.userInfo}>
                  <span className={styles.username}>{user.name}</span>
                  <div className={styles.rarityCounts}>
                    <div className={styles.countGroup}>
                      <span className={styles.rarityDot} style={{ backgroundColor: 'var(--rarity-legendary)' }}></span>
                      {user.counts.Lendaria}
                    </div>
                    <div className={styles.countGroup}>
                      <span className={styles.rarityDot} style={{ backgroundColor: 'var(--rarity-epic)' }}></span>
                      {user.counts.Epica}
                    </div>
                    <div className={styles.countGroup}>
                      <span className={styles.rarityDot} style={{ backgroundColor: 'var(--rarity-rare)' }}></span>
                      {user.counts.Rara}
                    </div>
                    <div className={styles.countGroup}>
                      <span className={styles.rarityDot} style={{ backgroundColor: 'var(--rarity-common)' }}></span>
                      {user.counts.Comum}
                    </div>
                  </div>
                </div>

                <div className={styles.scoreContainer}>
                  <span className={styles.scoreValue}>{user.totalScore}</span>
                  <span className={styles.scoreLabel}>Pontos</span>
                </div>

                <div className={styles.completionContainer}>
                  <div className={styles.completionValue}>{user.completion}%</div>
                  <div className={styles.completionBar}>
                    <div 
                      className={styles.completionFill} 
                      style={{ width: `${user.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
