import * as React from 'react'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav
      className="w-full sticky top-0 z-40"
      style={{
        background: 'var(--cup-nav-bg)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid var(--cup-rule)',
      }}
    >
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-[22px]">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-[-0.022em]"
          style={{ color: 'var(--cup-ink)' }}
        >
          chakit<span style={{ color: 'var(--cup-accent-d)' }}>.ai</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/components-demo"
            className="text-[13px] tracking-[-0.012em] transition-opacity hover:opacity-70"
            style={{ color: 'var(--cup-ink-2)' }}
          >
            Components
          </Link>
        </div>
      </div>
    </nav>
  )
}
