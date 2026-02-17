import { createContext, useContext, useState, type ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const SheetContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Sheet({ children }: { children: ReactNode }): ReactNode {
  const [open, setOpen] = useState(false)
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>
}

export function SheetTrigger({
  children,
  asChild
}: {
  children: ReactNode
  asChild?: boolean
}): ReactNode {
  const { setOpen } = useContext(SheetContext)
  if (asChild) {
    return <span onClick={() => setOpen(true)}>{children}</span>
  }
  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export function SheetContent({
  className,
  children
}: {
  className?: string
  children: ReactNode
}): ReactNode {
  const { open, setOpen } = useContext(SheetContext)
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setOpen(false)} />
      <div
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
          className
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </>
  )
}

export function SheetHeader({
  className,
  children
}: {
  className?: string
  children: ReactNode
}): ReactNode {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
      {children}
    </div>
  )
}

export function SheetTitle({
  className,
  children
}: {
  className?: string
  children: ReactNode
}): ReactNode {
  return <h3 className={cn('text-lg font-semibold text-foreground', className)}>{children}</h3>
}
