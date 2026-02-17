import type { LabelHTMLAttributes, ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Implemnet props to actually pass htmlFor for accessibility
export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>): ReactNode {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}
