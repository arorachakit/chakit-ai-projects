import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className = '', variant = 'primary', style, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-full px-[22px] py-3 text-[15px] font-medium tracking-[-0.012em] transition-all hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--cup-ink)', color: 'var(--cup-bg)' }
      : variant === 'secondary'
      ? { background: 'var(--cup-surface)', color: 'var(--cup-ink)', border: '1px solid var(--cup-rule-2)' }
      : { background: 'transparent', color: 'var(--cup-ink)' }

  return <button className={`${base} ${className}`} style={{ ...variantStyle, ...style }} {...props} />
}
