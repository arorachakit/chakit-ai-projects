import './globals.css'
import { ReactNode } from 'react'
import {
  Fraunces,
  Inter_Tight,
  Instrument_Serif,
  JetBrains_Mono,
} from 'next/font/google'

const sans = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const serifCup = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif-cup',
  display: 'swap',
})
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title:
    process.env.NEXT_PUBLIC_APP_NAME ||
    'chakit.ai · Voice Agents',
  description:
    'Create, manage, and test custom voice agents — the chakit.ai dashboard.',
}

const themeBootstrap = `
(function(){
  try {
    var k='chakit-theme';
    var s=localStorage.getItem(k);
    var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t=s||(d?'dark':'light');
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serifCup.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
