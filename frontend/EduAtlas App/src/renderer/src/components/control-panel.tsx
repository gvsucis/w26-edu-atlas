import { useState } from 'react'
import { Zap, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'
import { Switch } from './switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Alert, AlertTitle, AlertDescription } from './alert'
import { Separator } from './separator'
import { Label } from './label'

export default function ControlPanel(): React.ReactNode {
  const [workingMemory, setWorkingMemory] = useState('7')
  const [autoChunking, setAutoChunking] = useState(true)
  const [progressiveDisclosure, setProgressiveDisclosure] = useState(true)

  const [readingLevel, setReadingLevel] = useState('Grade 9-10')
  const [academicVocab, setAcademicVocab] = useState(true)
  const [sentenceLimit, setSentenceLimit] = useState(true)
  const [activeVoice, setActiveVoice] = useState(true)

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
                        <SelectItem value="5">5 items (Lower cognitive capacity)</SelectItem>
                        <SelectItem value="7">7 items (Standard)</SelectItem>
                        <SelectItem value="9">9 items (Advanced learners)</SelectItem>
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
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Intrinsic Load Optimization</p>
                      <p className="text-xs text-muted-foreground">
                        Breaking complex concepts into prerequisite chains
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Extraneous Load Reduction</p>
                      <p className="text-xs text-muted-foreground">
                        Minimizing irrelevant information and distractions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Germane Load Enhancement</p>
                      <p className="text-xs text-muted-foreground">
                        Promoting schema construction through examples
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Multimodal Integration</p>
                      <p className="text-xs text-muted-foreground">
                        Balancing text, visual, and interactive elements
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
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Sentence Length</span>
                    <span className="text-sm font-medium">16 words</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reading Ease</span>
                    <span className="text-sm font-medium">68 (Standard)</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Grade</span>
                    <span className="text-sm font-medium">9</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Academic Terms</span>
                    <span className="text-sm font-medium">12 per page</span>
                  </div>
                </div>
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
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Configuration</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
