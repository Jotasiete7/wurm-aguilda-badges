import type { Metadata } from 'next'
import './globals.css'

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Guilda Badges — A Guilda',
  description: 'Sua carteira de identidade e reputação no Ecossistema de Wurm Online.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
