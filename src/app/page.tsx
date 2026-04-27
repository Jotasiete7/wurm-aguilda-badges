import React from 'react';
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect('/wallet');

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.shield}>
          <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5L5 25V60C5 85 25 108 50 115C75 108 95 85 95 60V25L50 5Z"
              fill="url(#shieldGrad)" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
            <text x="50" y="72" textAnchor="middle" fontSize="40" fill="rgba(212,175,55,0.9)">⚔</text>
            <defs>
              <linearGradient id="shieldGrad" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1b1c24" />
                <stop offset="100%" stopColor="#0a0a0c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className={styles.eyebrow}>// A Guilda</p>
        <h1 className={styles.title}>Guilda <span>Badges</span></h1>
        <p className={styles.subtitle}>
          Sua carteira de identidade e reputação. Obtenha e exiba insígnias místicas do ecossistema.
        </p>

        <div className={styles.buttonGroup}>
          <form action={async () => {
            "use server"
            await signIn("discord")
          }}>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '1.05rem', width: '240px', gap: '0.75rem' }}>
              <svg style={{ width: 20, height: 20, fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Entrar com Discord
            </button>
          </form>

          {isDev && (
            <form action={async () => {
              "use server"
              await signIn("teste_local")
            }}>
              <button type="submit" className="btn" style={{ fontSize: '0.8rem', width: '240px', opacity: 0.5 }}>
                🧪 Testar Localmente
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
