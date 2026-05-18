import type { Metadata } from 'next'
import './globals.css'

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Guilda Badges — A Guilda',
  description: 'Sua carteira de identidade e reputação no Ecossistema de Wurm Online.',
  icons: {
    icon: '/favicon.png',
  },
}

import { LanguageProvider } from '@/lib/i18n'
import { LayoutBase } from '@ecossistema-guilda/layout/LayoutBase'
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          <LayoutBase>
            {children}
          </LayoutBase>
        </LanguageProvider>
        <Script 
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js" 
          strategy="afterInteractive" 
        />
        <Script id="kofi-widget" strategy="afterInteractive">
          {`
            kofiWidgetOverlay.draw('aguildanode', {
              'type': 'floating-chat',
              'floating-chat.donateButton.text': 'Support Us',
              'floating-chat.donateButton.background-color': '#fcbf47',
              'floating-chat.donateButton.text-color': '#323842'
            });
          `}
        </Script>
      </body>
    </html>
  )
}
