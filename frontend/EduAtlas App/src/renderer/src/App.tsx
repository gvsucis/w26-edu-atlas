import { useState } from 'react'
import { Brain, LayoutDashboard, Settings, GraduationCap, Menu, LogOut, User } from 'lucide-react'
import { Button } from './components/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from './components/sheet'
import Dashboard from './components/dashboard'
import ControlPanel from './components/control-panel'
import Login, { type InstructorProfile } from './components/login'

type View = 'dashboard' | 'control-panel'

function loadProfile(): InstructorProfile | null {
  try {
    const raw = localStorage.getItem('eduatlas_user')
    return raw ? (JSON.parse(raw) as InstructorProfile) : null
  } catch {
    return null
  }
}

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [profile, setProfile] = useState<InstructorProfile | null>(loadProfile)

  function handleLogin(p: InstructorProfile): void {
    setProfile(p)
  }

  function handleLogout(): void {
    localStorage.removeItem('eduatlas_user')
    setProfile(null)
  }

  if (!profile) {
    return <Login onLogin={handleLogin} />
  }

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

              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white/20">
                <div className="flex items-center space-x-1.5 text-sm text-blue-100">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-white">{profile.fullName}</span>
                  <span className="text-blue-300">&middot;</span>
                  <span>{profile.school}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
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
                    <div className="pt-4 border-t mt-2">
                      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{profile.fullName}</span>
                      </div>
                      <div className="px-3 pb-2 text-xs text-gray-400">{profile.school}</div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
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

      {/* Should make component and get current year with js*/}
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
