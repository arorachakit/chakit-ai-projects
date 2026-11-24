import './globals.css'
import '@chakit/config/neural.css'
import { ReactNode } from 'react'
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'

const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--nr-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--nr-mono', display: 'swap' })

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME || 'Custom voice agents'} · Live demo · The Vinci Labs`,
  description: 'Create, manage, and test custom voice agents.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
