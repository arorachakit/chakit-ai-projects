import * as React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', style, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-[12px] px-4 py-2.5 text-[15px] tracking-[-0.012em] outline-none transition-shadow focus:ring-2 focus:ring-offset-0 ${className}`}
      style={{
        background: 'var(--cup-surface)',
        color: 'var(--cup-ink)',
        border: '1px solid var(--cup-rule)',
        ...style,
      }}
      {...props}
    />
  )
})
