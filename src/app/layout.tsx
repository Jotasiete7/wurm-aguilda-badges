import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guilda Badges',
  description: 'Sua carteira de identidade e reputação no Ecossistema',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
