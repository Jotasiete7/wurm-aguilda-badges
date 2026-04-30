import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { auth, signOut } from '@/auth';
import EcosystemDropdown from './EcosystemDropdown';
import db from '@/lib/db';
import { T } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

export default async function Header() {
  const session = await auth();

  let isAdmin = false;
  if (session?.user?.id) {
    const { data: adminRow } = await db.from('admins').select('id').eq('discord_id', session.user.id).single();
    isAdmin = !!adminRow;
  }

  return (
    <header className={styles.header}>
      <div className={styles.brandContainer}>
        <EcosystemDropdown />
        <div className={styles.divider}></div>
        <Link href="/wallet" className={styles.brand}>
          A Guilda <span>Badges</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        {session?.user && (
          <>
            <Link href="/wallet" className={styles.navLink}><T en="Inventory" pt="Inventário" /></Link>
            <Link href="/ranking" className={styles.navLink}><T en="Hall of Fame" pt="Hall da Fama" /></Link>
          </>
        )}
        {isAdmin && (
          <Link href="/admin" className={styles.navLink + ' ' + styles.navLinkAdmin}>
            <T en="⚔ Guild Panel" pt="⚔ Painel da Guilda" />
          </Link>
        )}
      </nav>

      <div className={styles.userSection}>
        <LanguageSelector />
        {session?.user && (
          <>
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
              <button type="submit" className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>
                <T en="Logout" pt="Desconectar" />
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
