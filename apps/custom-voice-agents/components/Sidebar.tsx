"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Bot, PhoneCall, Activity, BarChart2 } from 'lucide-react'
import clsx from 'clsx'

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
      aria-current={active ? 'page' : undefined}
      onClick={(e) => disabled && e.preventDefault()}
      className={clsx(
        'flex shrink-0 items-center gap-3 rounded-full px-4 min-h-[44px] text-[14px] transition-colors',
        active ? 'bg-white/[.07] text-[var(--fg)]' : 'text-[var(--mute)]',
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[.04] hover:text-[var(--fg)]',
      )}
    >
      <Icon size={16} className={active ? 'text-[var(--accent)]' : undefined} />
      <span>{label}</span>
    </Link>
  )
}

/* Desktop: a sticky column under the site nav. Phone: a row of pills that scrolls sideways. */
export default function Sidebar() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Voice agents'
  return (
    <aside className="flex flex-col md:w-52 md:shrink-0 md:sticky md:top-[78px] md:h-[calc(100dvh-78px)] md:pt-10 md:pb-8">
      <div className="hidden md:block mb-6">
        <span className="mono nr-kick">
          <i aria-hidden="true" />
          {appName}
        </span>
      </div>
      <nav
        aria-label="Dashboard"
        className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1 py-1 [scrollbar-width:none]"
      >
        <Item href="/agents" label="Agents" icon={Bot} />
        <Item href="/live" label="Live" icon={PhoneCall} />
        <Item href="/calls" label="Calls" icon={Activity} />
        <Item href="/analytics" label="Analytics" icon={BarChart2} />
        <Item href="/settings" label="Settings" icon={Settings} disabled />
      </nav>
      <div className="mono mt-auto pt-4 hidden md:block" style={{ borderTop: '1px solid var(--line)' }}>
        Live demo · v1.0
      </div>
    </aside>
  )
}
