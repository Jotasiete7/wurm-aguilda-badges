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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          <LayoutBase>
            {children}
          </LayoutBase>
        </LanguageProvider>
      </body>
    </html>
  )
}
