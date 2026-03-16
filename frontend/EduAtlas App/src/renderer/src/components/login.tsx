import { useState, type FormEvent } from 'react'
import { Brain, GraduationCap, User, School } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'

export interface InstructorProfile {
  fullName: string
  school: string
}

interface LoginProps {
  onLogin: (profile: InstructorProfile) => void
}

export default function Login({ onLogin }: LoginProps): React.JSX.Element {
  const [fullName, setFullName] = useState('')
  const [school, setSchool] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; school?: string }>({})

  function validate(): boolean {
    const next: { fullName?: string; school?: string } = {}
    if (!fullName.trim()) next.fullName = 'Full name is required.'
    if (!school.trim()) next.school = 'School name is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (!validate()) return
    const profile: InstructorProfile = { fullName: fullName.trim(), school: school.trim() }
    localStorage.setItem('eduatlas_user', JSON.stringify(profile))
    onLogin(profile)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 h-16">
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-blue-600 rounded-full p-4 mb-4 shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
            <p className="mt-2 text-gray-500 text-sm">Enter your details to get started</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gray-700">Instructor Profile</CardTitle>
              <CardDescription>Used to personalise your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                    }}
                    className={errors.fullName ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="school" className="flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 text-blue-500" />
                    School
                  </Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="e.g. Lincoln High School"
                    value={school}
                    onChange={(e) => {
                      setSchool(e.target.value)
                      if (errors.school) setErrors((prev) => ({ ...prev, school: undefined }))
                    }}
                    className={errors.school ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  />
                  {errors.school && <p className="text-xs text-red-500">{errors.school}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2 cursor-pointer"
                >
                  Get Started
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-400 mt-6">
            No account required &mdash; your profile is stored only on this device.
          </p>
        </div>
      </main>

      <footer className="border-t bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <span className="text-sm text-gray-400">
            EduStaff &middot; Capstone Project &middot; January 2026
          </span>
        </div>
      </footer>
    </div>
  )
}
