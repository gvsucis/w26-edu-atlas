import { useState } from 'react'
import { BookOpen, Target, FileText, Sparkles, Download, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Badge } from './badge'
import { Separator } from './separator'

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

export default function Dashboard(): React.ReactNode {
  const [subject, setSubject] = useState('Science')
  const [lessonTopic, setLessonTopic] = useState('')
  const [duration, setDuration] = useState(45)
  const [classroomContext, setClassroomContext] = useState('')
  const [objectives, setObjectives] = useState<LearningObjective[]>([
  ])
  const [newBloomLevel, setNewBloomLevel] = useState('Remember')
  const [newObjectiveText, setNewObjectiveText] = useState('')
  const [materials, setMaterials] = useState<GeneratedMaterial[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

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

  const generateMaterials = (): void => {
    setIsGenerating(true)
    setTimeout(() => {
      setMaterials([
        { id: 1, type: 'Lesson Plan', title: 'Photosynthesis Deep Dive', difficulty: 'Advanced' },
        {
          id: 2,
          type: 'Assessment',
          title: 'Ecosystem Analysis Quiz',
          difficulty: 'Intermediate'
        },
        { id: 3, type: 'Activity', title: 'Plant Lab Investigation', difficulty: 'Beginner' }
      ])
      setIsGenerating(false)
    }, 2000)
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
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
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
                      <Label>Bloom's Level</Label>
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

                <Button className="w-full" onClick={generateMaterials} disabled={isGenerating || !subject || !lessonTopic.trim() || !duration || objectives.length === 0}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating Materials...' : 'Generate Instructional Materials'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                      <Button variant="ghost" size="icon">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
