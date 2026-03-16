import { useState } from 'react'
import { Zap, Brain, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'
import { Switch } from './switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Alert, AlertTitle, AlertDescription } from './alert'
import { Separator } from './separator'
import { Label } from './label'

const STORAGE_KEY = 'eduatlas_control_panel'

const defaults = {
  workingMemory: '7',
  autoChunking: true,
  progressiveDisclosure: true,
  readingLevel: 'Grade 6-7',
  academicVocab: true,
  sentenceLimit: true,
  activeVoice: true
}

const levelMetrics: Record<string, { ease: number; easeLabel: string; grade: string; baseSentence: number; baseTerms: number }> = {
  'Grade K-1':     { ease: 95, easeLabel: 'Very Easy',        grade: 'K–1',  baseSentence: 8,  baseTerms: 2  },
  'Grade 2-3':     { ease: 85, easeLabel: 'Easy',             grade: '2–3',  baseSentence: 10, baseTerms: 4  },
  'Grade 4-5':     { ease: 75, easeLabel: 'Fairly Easy',      grade: '4–5',  baseSentence: 13, baseTerms: 6  },
  'Grade 6-7':     { ease: 65, easeLabel: 'Standard',         grade: '6–7',  baseSentence: 16, baseTerms: 9  },
  'Grade 8':       { ease: 58, easeLabel: 'Standard',         grade: '8',    baseSentence: 18, baseTerms: 11 },
  'Grade 9-10':    { ease: 50, easeLabel: 'Fairly Difficult', grade: '9–10', baseSentence: 20, baseTerms: 14 },
  'Grade 11-12':   { ease: 38, easeLabel: 'Difficult',        grade: '11–12',baseSentence: 23, baseTerms: 17 },
  'College Level': { ease: 25, easeLabel: 'Very Difficult',   grade: '13+',  baseSentence: 26, baseTerms: 20 },
}

function loadSettings(): typeof defaults {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...(JSON.parse(raw) as typeof defaults) } : defaults
  } catch {
    return defaults
  }
}

export default function ControlPanel(): React.ReactNode {
  const saved = loadSettings()
  const [workingMemory, setWorkingMemory] = useState(saved.workingMemory)
  const [autoChunking, setAutoChunking] = useState(saved.autoChunking)
  const [progressiveDisclosure, setProgressiveDisclosure] = useState(saved.progressiveDisclosure)

  const [readingLevel, setReadingLevel] = useState(saved.readingLevel)
  const [academicVocab, setAcademicVocab] = useState(saved.academicVocab)
  const [sentenceLimit, setSentenceLimit] = useState(saved.sentenceLimit)
  const [activeVoice, setActiveVoice] = useState(saved.activeVoice)

  const [saved_, setSaved_] = useState(false)

  function handleSave(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ workingMemory, autoChunking, progressiveDisclosure, readingLevel, academicVocab, sentenceLimit, activeVoice })
    )
    setSaved_(true)
    setTimeout(() => setSaved_(false), 2000)
  }

  function handleReset(): void {
    setWorkingMemory(defaults.workingMemory)
    setAutoChunking(defaults.autoChunking)
    setProgressiveDisclosure(defaults.progressiveDisclosure)
    setReadingLevel(defaults.readingLevel)
    setAcademicVocab(defaults.academicVocab)
    setSentenceLimit(defaults.sentenceLimit)
    setActiveVoice(defaults.activeVoice)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Control Panel</h2>
        <p className="text-muted-foreground">
          Configure AI constraints and instructional parameters
        </p>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertTitle>AI System Active</AlertTitle>
        <AlertDescription>
          All constraints are being applied to AI outputs in real-time.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="cognitive">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="cognitive">
            <Brain className="h-4 w-4 mr-2" />
            Cognitive Load
          </TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="cognitive">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Load Management</CardTitle>
                <CardDescription>
                  Control how information is presented to reduce cognitive overload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Working Memory Constraints</Label>
                    <Select value={workingMemory} onValueChange={setWorkingMemory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items (Beginner)</SelectItem>
                        <SelectItem value="7">7 items (Standard)</SelectItem>
                        <SelectItem value="9">9 items (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Maximum number of concepts introduced per section
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Auto-Chunking</Label>
                      <Switch checked={autoChunking} onCheckedChange={setAutoChunking} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically break content into manageable chunks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Progressive Disclosure</Label>
                      <Switch
                        checked={progressiveDisclosure}
                        onCheckedChange={setProgressiveDisclosure}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reveal information gradually as learner progresses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Constraints</CardTitle>
                <CardDescription>Currently applied cognitive load rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Working Memory Limit</p>
                      <p className="text-xs text-muted-foreground">
                        Max {workingMemory} concepts per section &mdash;{' '}
                        {workingMemory === '5' ? 'Beginner' : workingMemory === '7' ? 'Standard' : 'Advanced'}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${autoChunking ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="text-sm font-medium">Auto-Chunking</p>
                      <p className="text-xs text-muted-foreground">
                        {autoChunking
                          ? 'Content is automatically broken into manageable chunks'
                          : 'Content chunking is disabled. Full sections shown at once'}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${progressiveDisclosure ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="text-sm font-medium">Progressive Disclosure</p>
                      <p className="text-xs text-muted-foreground">
                        {progressiveDisclosure
                          ? 'Information is revealed gradually as the learner progresses'
                          : 'All content shown upfront, no staged reveal'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="language">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Complexity Control</CardTitle>
                <CardDescription>
                  Manage vocabulary difficulty and sentence structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Reading Level Target</Label>
                    <Select value={readingLevel} onValueChange={setReadingLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reading level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade K-1">Grade K-1</SelectItem>
                        <SelectItem value="Grade 2-3">Grade 2-3</SelectItem>
                        <SelectItem value="Grade 4-5">Grade 4-5</SelectItem>
                        <SelectItem value="Grade 6-7">Grade 6-7</SelectItem>
                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                        <SelectItem value="Grade 9-10">Grade 9-10</SelectItem>
                        <SelectItem value="Grade 11-12">Grade 11-12</SelectItem>
                        <SelectItem value="College Level">College Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Academic Vocabulary Support</Label>
                      <Switch checked={academicVocab} onCheckedChange={setAcademicVocab} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Provide definitions for domain-specific terms
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Sentence Length Limit</Label>
                      <Switch checked={sentenceLimit} onCheckedChange={setSentenceLimit} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep sentences under 20 words when possible
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Active Voice Preference</Label>
                      <Switch checked={activeVoice} onCheckedChange={setActiveVoice} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prioritize active over passive constructions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Metrics</CardTitle>
                <CardDescription>Current output analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const m = levelMetrics[readingLevel]
                  const sentenceLen = sentenceLimit ? Math.min(m.baseSentence, 18) : m.baseSentence
                  const terms = academicVocab ? m.baseTerms : Math.max(1, Math.round(m.baseTerms / 2))
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Sentence Length</span>
                        <span className="text-sm font-medium">{sentenceLen} words</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reading Ease</span>
                        <span className="text-sm font-medium">{m.ease} ({m.easeLabel})</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Grade</span>
                        <span className="text-sm font-medium">{m.grade}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Academic Terms</span>
                        <span className="text-sm font-medium">{terms} per page</span>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">All constraints active and enforced</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
              <Button onClick={handleSave}>
                {saved_ ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
