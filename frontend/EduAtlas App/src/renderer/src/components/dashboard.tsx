import { useState } from 'react'
import {
  BookOpen,
  Target,
  FileText,
  Sparkles,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Badge } from './badge'
import { Separator } from './separator'
import { generateContent } from '../lib/api'

interface LearningObjective {
  id: number
  bloomLevel: string
  text: string
}

interface GeneratedMaterial {
  id: number
  type: 'Lesson Plan' | 'Assessment' | 'Activity'
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

interface ValidationState {
  report: string
  raw?: Record<string, unknown>
  success: boolean
  attempts_used: number
  message?: string
}

export default function Dashboard(): React.ReactNode {
  const [subject, setSubject] = useState('')
  const [gradeBand, setGradeBand] = useState('')
  const [deliverableType, setDeliverableType] = useState('')
  const [lessonTopic, setLessonTopic] = useState('')
  const [duration, setDuration] = useState(45)
  const [classroomContext, setClassroomContext] = useState('')
  const [objectives, setObjectives] = useState<LearningObjective[]>([])
  const [newBloomLevel, setNewBloomLevel] = useState('Remember')
  const [newObjectiveText, setNewObjectiveText] = useState('')
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const [generatedText, setGeneratedText] = useState('')
  const [validationState, setValidationState] = useState<ValidationState | null>(null)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null)

  const addObjective = (): void => {
    if (newObjectiveText.trim() === '') return

    const newObjective: LearningObjective = {
      id: Date.now(),
      bloomLevel: newBloomLevel,
      text: newObjectiveText
    }

    setObjectives([...objectives, newObjective])
    setNewBloomLevel('Remember')
    setNewObjectiveText('')
  }

  const removeObjective = (id: number): void => {
    setObjectives(objectives.filter((obj) => obj.id !== id))
  }

  const generateMaterials = async (): Promise<void> => {
    setIsGenerating(true)
    setError('')
    setGeneratedText('')
    setValidationState(null)
    setPlan(null)

    // Pulls content from api, throws error if data doesn't match expected form
    try {
      const result = await generateContent({
        subject,
        grade_band: gradeBand as 'K-2' | '3-5' | '6-8' | '9-12',
        lesson_topic: lessonTopic,
        duration_minutes: duration,
        classroom_context: classroomContext,
        deliverable_type: deliverableType as
            'Exam'
          | 'Quiz'
          | 'Homework'
          | 'Lesson Plan'
          | 'Activity'
          | 'Worksheet',
        objectives: objectives.map((obj) => ({
          bloom_level: obj.bloomLevel,
          text: obj.text
        }))
      })

      setGeneratedText(result.deliverable.content)
      setPlan(result.metadata?.plan ?? null)

      setValidationState({
        report: result.validation.report ?? '',
        raw: result.validation.raw ?? undefined,
        success: result.validation.success,
        attempts_used: result.validation.attempts_used,
        message: result.validation.message
      })

      setMaterials([
        {
          id: Date.now(),
          type:
            deliverableType === 'Exam' || deliverableType === 'Quiz' || deliverableType === 'Homework'
              ? 'Assessment'
              : deliverableType === 'Activity'
                ? 'Activity'
                : 'Lesson Plan',
          title: lessonTopic.trim() || `Generated ${deliverableType}`,
          difficulty: objectives.length >= 3 ? 'Intermediate' : 'Beginner'
        }
      ])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Generation failed.')
      setMaterials([])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Instructional Planning Dashboard</h2>
        <p className="text-muted-foreground">
          Design curriculum-aligned lessons with AI-powered differentiation
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>Curriculum Information</CardTitle>
              </div>
              <CardDescription>Define the scope and context of your instruction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Language Arts">Language Arts</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="World Languages">World Languages</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Theater">Theater</SelectItem>
                      <SelectItem value="Visual Arts">Visual Arts</SelectItem>
                      <SelectItem value="Dance">Dance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2">
                  <Label>Grade Band</Label>
                  <Select value={gradeBand} onValueChange={setGradeBand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade band" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K-2">K-2</SelectItem>
                      <SelectItem value="3-5">3-5</SelectItem>
                      <SelectItem value="6-8">6-8</SelectItem>
                      <SelectItem value="9-12">9-12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2">
                <Label>Deliverable Type</Label>
                <Select value={deliverableType} onValueChange={setDeliverableType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deliverable type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lesson Plan">Lesson Plan</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                    <SelectItem value="Worksheet">Worksheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-2">
                  <Label>Lesson Topic</Label>
                  <Input
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="Enter lesson topic"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="Duration in minutes"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Classroom Context (optional)</Label>
                  <Textarea
                    rows={3}
                    value={classroomContext}
                    onChange={(e) => setClassroomContext(e.target.value)}
                    placeholder="Describe any specific classroom needs, accommodations, or contextual information..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <CardTitle>Learning Objectives</CardTitle>
              </div>
              <CardDescription>Define what students should know and be able to do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {objectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="bg-muted/50 rounded-lg p-3 flex items-center gap-3"
                    >
                      <Badge variant="secondary">{objective.bloomLevel}</Badge>
                      <span className="flex-1 text-sm">{objective.text}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeObjective(objective.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end">
                    <div className="space-y-2">
                      <Label>Bloom&apos;s Level</Label>
                      <Select value={newBloomLevel} onValueChange={setNewBloomLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Remember">Remember</SelectItem>
                          <SelectItem value="Understand">Understand</SelectItem>
                          <SelectItem value="Apply">Apply</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Objective</Label>
                      <Input
                        value={newObjectiveText}
                        onChange={(e) => setNewObjectiveText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addObjective()
                        }}
                        placeholder="Students will be able to..."
                      />
                    </div>
                    <Button onClick={addObjective} size="default">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={generateMaterials}
                  disabled={
                    isGenerating ||
                    !subject ||
                    !lessonTopic.trim() ||
                    !duration ||
                    objectives.length === 0
                  }
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating Materials...' : 'Generate Instructional Materials'}
                </Button>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Generated Deliverable</CardTitle>
              </div>
              <CardDescription>The teacher-facing output returned by the backend</CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedText ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No generated deliverable yet. Complete the form and generate materials.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{generatedText}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {validationState?.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <CardTitle>Validation Report</CardTitle>
              </div>
              <CardDescription>Internal quality checks returned by the backend</CardDescription>
            </CardHeader>
            <CardContent>
              {!validationState ? (
                <p className="text-sm text-muted-foreground">No validation report yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={validationState.success ? 'default' : 'secondary'}>
                      {validationState.success ? 'Passed' : 'Failed'}
                    </Badge>
                    <Badge variant="outline">Attempts: {validationState.attempts_used}</Badge>
                  </div>

                  {validationState.message && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                      <p className="text-sm">{validationState.message}</p>
                    </div>
                  )}

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">Validation Report</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toISOString().split('T')[0]}
                      </span>
                    </div>

                    <pre className="whitespace-pre-wrap text-xs font-sans">
                      {validationState.report}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {plan && (
            <Card>
              <CardHeader>
                <CardTitle>Planning Metadata</CardTitle>
                <CardDescription>Structured planning data returned by the AI planner</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-xs font-sans">
                    {JSON.stringify(plan, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Generated Materials</CardTitle>
              </div>
              <CardDescription>AI-generated, differentiated resources</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No materials generated yet. Configure your lesson and click generate to create
                    differentiated resources.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="hover:bg-muted/50 rounded-lg p-3 transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <Badge variant="outline">{material.type}</Badge>
                        <p className="font-medium">{material.title}</p>
                        <p className="text-sm text-muted-foreground">{material.difficulty}</p>
                      </div>
                      <Button variant="ghost" size="icon" disabled>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planning Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Learning Objectives</span>
                  <span className="text-sm font-medium">{objectives.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Generated Resources</span>
                  <span className="text-sm font-medium">{materials.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Prep Time</span>
                  <span className="text-sm font-medium">15 min</span>
                </div>
                {validationState && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Validation Status</span>
                      <span className="text-sm font-medium">
                        {validationState.success ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History Log
              </CardTitle>
              <CardDescription>Recently generated materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No generated materials yet</p>
                </div>
                <Separator />
                <button className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer mx-auto">
                  <span>View all generated materials</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
