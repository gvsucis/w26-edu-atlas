import { createContext, useContext, useState, type ReactNode } from 'react'

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const TabsContext = createContext<{
  value: string
  setValue: (v: string) => void
}>({ value: '', setValue: () => {} })

interface TabsProps {
  defaultValue: string
  className?: string
  children: ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps): ReactNode {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children
}: {
  className?: string
  children: ReactNode
}): ReactNode {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}): ReactNode {
  const ctx = useContext(TabsContext)
  const isActive = ctx.value === value
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50 hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children
}: {
  value: string
  className?: string
  children: ReactNode
}): ReactNode {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  )
}
