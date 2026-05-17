import * as React from 'react'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', style, ...props },
  ref,
) {
  return (
    <textarea
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
