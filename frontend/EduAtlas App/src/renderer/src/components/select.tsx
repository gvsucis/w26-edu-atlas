import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | null>(null)

function useSelectContext(): SelectContextType {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select components must be used within a Select')
  return ctx
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps): ReactNode {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children
}: {
  className?: string
  children: ReactNode
}): ReactNode {
  const ctx = useSelectContext()

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className
      )}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }): ReactNode {
  const ctx = useSelectContext()
  return <span>{ctx.value || placeholder}</span>
}

export function SelectContent({ children }: { children: ReactNode }): ReactNode {
  const ctx = useSelectContext()
  if (!ctx.open) return null
  return (
    <div className="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }): ReactNode {
  const ctx = useSelectContext()
  const isSelected = ctx.value === value
  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      onClick={() => {
        ctx.onValueChange(value)
        ctx.setOpen(false)
      }}
    >
      {children}
    </div>
  )
}
