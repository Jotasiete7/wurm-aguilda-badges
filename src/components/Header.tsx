import React from 'react';
import styles from './Header.module.css';
import { auth, signOut } from '@/auth';
import EcosystemDropdown from './EcosystemDropdown';

export default async function Header() {
  const session = await auth();

  return (
    <header className={styles.header}>
      <div className={styles.brandContainer}>
        <EcosystemDropdown />
        <div className={styles.divider}></div>
        <div className={styles.brand}>
          A Guilda <span>Badges</span>
        </div>
      </div>
      
      {session?.user && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.username}>{session.user.name}</span>
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "Avatar"} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
          </div>
          <form action={async () => {
              "use server"
              await signOut({ redirectTo: '/' })
          }}>
             <button type="submit" className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>Desconectar</button>
          </form>
        </div>
      )}
    </header>
  );
}
