import type { HTMLAttributes, ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Card({ className, children }: HTMLAttributes<HTMLDivElement>): ReactNode {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: HTMLAttributes<HTMLDivElement>): ReactNode {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
}

export function CardTitle({ className, children }: HTMLAttributes<HTMLHeadingElement>): ReactNode {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children
}: HTMLAttributes<HTMLParagraphElement>): ReactNode {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function CardContent({ className, children }: HTMLAttributes<HTMLDivElement>): ReactNode {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}
