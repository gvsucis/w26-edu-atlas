import type { HTMLAttributes, ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const variants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-foreground',
  destructive: 'bg-destructive text-destructive-foreground'
}

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
}

export function Badge({ className, variant = 'default', children }: BadgeProps): ReactNode {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
