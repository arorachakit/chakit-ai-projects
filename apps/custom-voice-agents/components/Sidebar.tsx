"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Bot, PhoneCall, Activity, BarChart2 } from 'lucide-react'
import clsx from 'clsx'
import ThemeToggle from './ThemeToggle'

const Item = ({
  href,
  label,
  icon: Icon,
  disabled = false,
}: {
  href: string
  label: string
  icon: any
  disabled?: boolean
}) => {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={disabled ? '#' : href}
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      className={clsx(
        'group relative flex items-center gap-3 rounded-[12px] px-3 py-2 text-[14px] tracking-[-0.012em] transition-colors',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--cup-bg-3)]',
      )}
      style={
        active
          ? { background: 'var(--cup-bg-3)', color: 'var(--cup-ink)' }
          : { color: 'var(--cup-ink-2)' }
      }
    >
      {active && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
          style={{ background: 'var(--cup-accent)' }}
        />
      )}
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Voice Agents'
  return (
    <aside
      className="w-64 shrink-0 p-4 sticky top-0 h-screen flex flex-col"
      style={{
        background: 'var(--cup-surface)',
        borderRight: '1px solid var(--cup-rule)',
      }}
    >
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: 'oklch(0.65 0.18 145)' }}
          />
          <span
            className="text-[15px] font-semibold tracking-[-0.022em]"
            style={{ color: 'var(--cup-ink)' }}
          >
            chakit<span style={{ color: 'var(--cup-accent-d)' }}>.ai</span>
          </span>
        </div>
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--cup-ink-3)' }}
        >
          {appName}
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        <Item href="/agents" label="Agents" icon={Bot} />
        <Item href="/live" label="Live" icon={PhoneCall} />
        <Item href="/calls" label="Calls" icon={Activity} />
        <Item href="/analytics" label="Analytics" icon={BarChart2} />
        <Item href="/settings" label="Settings" icon={Settings} disabled />
      </nav>
      <div
        className="mt-auto pt-3"
        style={{ borderTop: '1px solid var(--cup-rule)' }}
      >
        <ThemeToggle variant="row" />
        <div
          className="px-3 pt-2 font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--cup-ink-3)' }}
        >
          v · 1.0
        </div>
      </div>
    </aside>
  )
}
