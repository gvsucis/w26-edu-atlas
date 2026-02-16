import type { HTMLAttributes, ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Alert({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactNode {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>): ReactNode {
  return (
    <h5
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
}

export function AlertDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): ReactNode {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props}>
      {children}
    </div>
  )
}
