import * as React from 'react'

export function Container({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-[1080px] px-[22px] ${className}`} {...props} />
}

export function Section({ className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={`py-20 sm:py-24 ${className}`} {...props} />
}
