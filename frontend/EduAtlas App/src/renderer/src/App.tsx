import { useState } from 'react'
import { Button } from './components/button'
import { Brain, LayoutDashboard, Settings, GraduationCap, Menu } from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from './components/sheet'
import Dashboard from './components/dashboard'
import ControlPanel from './components/control-panel'

type View = 'dashboard' | 'control-panel'

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<View>('dashboard')

  const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Planning Dashboard', icon: LayoutDashboard },
    { id: 'control-panel', label: 'Control Panel', icon: Settings }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">EduAtlas</h1>
                <p className="text-xs text-blue-200 hidden sm:block">
                  AI-Powered Lesson Design Platform
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span>EduAtlas</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentView === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id)}
                          className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex items-center space-x-2 text-sm text-blue-200">
            <GraduationCap className="h-4 w-4" />
            <span>EduStaff</span>
            <span>/</span>
            <span className="text-white font-medium">
              {currentView === 'dashboard' ? 'Planning Dashboard' : 'Control Panel'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' ? <Dashboard /> : <ControlPanel />}
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">AI System Active</span>
            </div>
            <div className="text-sm text-muted-foreground">
              EduStaff &middot; Capstone Project &middot; January 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
