import * as React from 'react'

export function Card({ className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[18px] overflow-hidden ${className}`}
      style={{
        background: 'var(--cup-surface)',
        border: '1px solid var(--cup-rule)',
        boxShadow: 'var(--cup-shadow-sm)',
        ...style,
      }}
      {...props}
    />
  )
}

export function CardHeader({ className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{ borderBottom: '1px solid var(--cup-rule)', ...style }}
      {...props}
    />
  )
}

export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`} {...props} />
}

export function CardFooter({ className = '', style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 ${className}`}
      style={{ borderTop: '1px solid var(--cup-rule)', ...style }}
      {...props}
    />
  )
}
