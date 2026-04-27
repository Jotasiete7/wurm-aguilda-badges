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

      {/* Decorative corner marks */}

      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

      <div className={styles.heroContent}>

        {/* Emblem Icon */}
        <div className={styles.emblemWrap}>
          <svg className={styles.emblemSvg} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGrad" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e1c16" />
                <stop offset="100%" stopColor="#0a0905" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Shield shape */}
            <path d="M50 6L7 24V60C7 84 26 107 50 114C74 107 93 84 93 60V24L50 6Z"
              fill="url(#shieldGrad)"
              stroke="rgba(212,180,131,0.45)"
              strokeWidth="1"
            />
            {/* Inner shield outline */}
            <path d="M50 16L17 31V60C17 79 31 98 50 104C69 98 83 79 83 60V31L50 16Z"
              fill="none"
              stroke="rgba(212,180,131,0.12)"
              strokeWidth="1"
            />
            {/* Cross swords */}
            <g filter="url(#glow)" opacity="0.9">
              <line x1="33" y1="38" x2="67" y2="82" stroke="#d4b483" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="67" y1="38" x2="33" y2="82" stroke="#d4b483" strokeWidth="2.5" strokeLinecap="round" />
              {/* Sword guards */}
              <line x1="27" y1="50" x2="43" y2="50" stroke="#d4b483" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="57" y1="50" x2="73" y2="50" stroke="#d4b483" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </svg>
          <div className={styles.emblemGlow} aria-hidden="true" />
        </div>

        {/* Eyebrow */}
        <p className={styles.eyebrow}>// A Guilda</p>

        {/* Title */}
        <h1 className={styles.title}>
          Guilda <span className={styles.titleAccent}>Badges</span>
        </h1>

        {/* Main subtitle */}
        <p className={styles.subtitle}>
          Identidade, reputação e pertencimento —<br />
          em forma de emblemas.
        </p>

        {/* Supporting line */}
        <p className={styles.supportText}>
          Conecte-se com o Discord para acessar sua carteira.
        </p>

        {/* CTA Button */}
        <div className={styles.buttonGroup}>
          <form action={async () => {
            "use server"
            await signIn("discord")
          }}>
            <button type="submit" id="discord-login-btn" className={styles.discordBtn}>
              <svg className={styles.discordIcon} viewBox="0 0 127.14 96.36" fill="currentColor">
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
              <button type="submit" className={styles.devBtn}>
                🧪 Testar Localmente
              </button>
            </form>
          )}
        </div>

        {/* LGPD Privacy Notice */}
        <div className={styles.privacyNotice} role="note" aria-label="Aviso de privacidade">
          <p>
            <span>Ao entrar, coletamos apenas seu nome de usuário, avatar e ID público do Discord</span>{' '}para identificá-lo no sistema de emblemas da Guilda.
            Os dados não são compartilhados com terceiros e podem ser removidos mediante solicitação,
            em conformidade com a <span>LGPD (Lei nº 13.709/2018)</span>.
          </p>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>no commands. no clutter. just identity.</p>

      </div>
    </div>
  );
}
