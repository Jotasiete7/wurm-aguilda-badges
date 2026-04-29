import React from 'react';
import db from '@/lib/db';
import Header from '@/components/Header';
import styles from './ranking.module.css';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function RankingPage() {
  // 1. Fetch total number of badges in the system for completion %
  const { count: totalBadgesCount } = await db.from('badges').select('id', { count: 'exact', head: true });
  const totalBadges = totalBadgesCount || 1;

  // 2. Fetch all user badges with their user and badge info
  // This is often more reliable than a deeply nested user -> user_badges -> badges query
  const { data: allUserBadges, error } = await db
    .from('user_badges')
    .select(`
      user_id,
      users:user_id (
        username,
        display_name,
        avatar
      ),
      badges:badge_id (
        rarity
      )
    `);

  if (error) {
    console.error("Error fetching ranking data:", error.message, error.details, error.hint);
    return (
      <div className={styles.wrapper}>
        <Header />
        <main className="container">
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Erro ao carregar o ranking. Por favor, tente novamente mais tarde.
          </div>
        </main>
      </div>
    );
  }

  // 3. Process data and group by user
  const userGroups: Record<string, any> = {};

  (allUserBadges || []).forEach((ub: any) => {
    const userId = ub.user_id;
    if (!userGroups[userId]) {
      const user = ub.users;
      userGroups[userId] = {
        id: userId,
        name: user?.display_name || user?.username || 'Aventureiro',
        avatar: user?.avatar,
        badgeCount: 0,
        totalScore: 0,
        counts: {
          Lendaria: 0,
          Epica: 0,
          Rara: 0,
          Comum: 0,
        },
      };
    }

    const group = userGroups[userId];
    const rarity = ub.badges?.rarity;
    
    group.badgeCount++;
    if (rarity === 'Lendaria') {
      group.counts.Lendaria++;
      group.totalScore += 4;
    } else if (rarity === 'Epica') {
      group.counts.Epica++;
      group.totalScore += 3;
    } else if (rarity === 'Rara') {
      group.counts.Rara++;
      group.totalScore += 2;
    } else {
      group.counts.Comum++;
      group.totalScore += 1;
    }
  });

  const ranking = Object.values(userGroups)
    .map((user: any) => ({
      ...user,
      completion: Math.round((user.badgeCount / totalBadges) * 100),
    }))
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
