import { useState } from 'react'
import { Zap, Brain, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'
import { Slider } from './slider'
import { Switch } from './switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Badge } from './badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Alert, AlertTitle, AlertDescription } from './alert'
import { Separator } from './separator'
import { Label } from './label'

export default function ControlPanel(): React.ReactNode {
  const [cognitiveLoad, setCognitiveLoad] = useState([60])
  const [workingMemory, setWorkingMemory] = useState('7')
  const [autoChunking, setAutoChunking] = useState(true)
  const [progressiveDisclosure, setProgressiveDisclosure] = useState(true)

  const [languageComplexity, setLanguageComplexity] = useState([45])
  const [readingLevel, setReadingLevel] = useState('Grade 9-10')
  const [academicVocab, setAcademicVocab] = useState(true)
  const [sentenceLimit, setSentenceLimit] = useState(true)
  const [activeVoice, setActiveVoice] = useState(true)

  const [scaffolding, setScaffolding] = useState([70])
  const [sequencingStrategy, setSequencingStrategy] = useState('Simple to Complex')
  const [prerequisiteChecking, setPrerequisiteChecking] = useState(true)
  const [adaptivePacing, setAdaptivePacing] = useState(true)
  const [masteryProgression, setMasteryProgression] = useState(true)

  const [wcagCompliance, setWcagCompliance] = useState(true)
  const [accessibilityLevel, setAccessibilityLevel] = useState('Level AA (Recommended)')
  const [altText, setAltText] = useState(true)
  const [screenReader, setScreenReader] = useState(true)
  const [colorContrast, setColorContrast] = useState(true)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [closedCaptions, setClosedCaptions] = useState(true)

  const steps = [
    { num: 1, title: 'Foundation Concepts' },
    { num: 2, title: 'Core Mechanisms' },
    { num: 3, title: 'Application Examples' },
    { num: 4, title: 'Analysis & Synthesis' },
    { num: 5, title: 'Evaluation Tasks' }
  ]

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
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="cognitive">
            <Brain className="h-4 w-4 mr-2" />
            Cognitive Load
          </TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="sequencing">Sequencing</TabsTrigger>
          <TabsTrigger value="accessibility">
            <Shield className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
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
                    <div className="flex items-center justify-between">
                      <Label>Maximum Cognitive Load</Label>
                      <Badge variant="secondary">{cognitiveLoad[0]}%</Badge>
                    </div>
                    <Slider
                      value={cognitiveLoad}
                      onValueChange={setCognitiveLoad}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Limits the amount of new information presented at once
                    </p>
                  </div>

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
                    <div className="flex items-center justify-between">
                      <Label>Language Complexity Level</Label>
                      <Badge variant="secondary">{languageComplexity[0]}%</Badge>
                    </div>
                    <Slider
                      value={languageComplexity}
                      onValueChange={setLanguageComplexity}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls vocabulary difficulty and sentence structure complexity
                    </p>
                  </div>

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

        <TabsContent value="sequencing">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructional Sequencing</CardTitle>
                <CardDescription>Configure content delivery order and pacing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Scaffolding Intensity</Label>
                      <Badge variant="secondary">{scaffolding[0]}%</Badge>
                    </div>
                    <Slider
                      value={scaffolding}
                      onValueChange={setScaffolding}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount of support and guidance provided to learners
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Sequencing Strategy</Label>
                    <Select value={sequencingStrategy} onValueChange={setSequencingStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Simple to Complex">Simple to Complex</SelectItem>
                        <SelectItem value="Concrete to Abstract">Concrete to Abstract</SelectItem>
                        <SelectItem value="Known to Unknown">Known to Unknown</SelectItem>
                        <SelectItem value="Spiral Curriculum">Spiral Curriculum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Prerequisite Checking</Label>
                      <Switch
                        checked={prerequisiteChecking}
                        onCheckedChange={setPrerequisiteChecking}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verify foundational knowledge before advancing
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Adaptive Pacing</Label>
                      <Switch checked={adaptivePacing} onCheckedChange={setAdaptivePacing} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adjust speed based on comprehension signals
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Mastery-Based Progression</Label>
                      <Switch
                        checked={masteryProgression}
                        onCheckedChange={setMasteryProgression}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Require competency before moving forward
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Sequence</CardTitle>
                <CardDescription>Order of topics in generated lesson plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary text-primary-foreground">
                        {step.num}
                      </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility & Inclusion</CardTitle>
                <CardDescription>WCAG compliance and accessibility features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>WCAG 2.1 Compliance</Label>
                      <Switch checked={wcagCompliance} onCheckedChange={setWcagCompliance} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Meet Web Content Accessibility Guidelines
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Accessibility Level</Label>
                    <Select value={accessibilityLevel} onValueChange={setAccessibilityLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Level A (Minimum)">Level A (Minimum)</SelectItem>
                        <SelectItem value="Level AA (Recommended)">
                          Level AA (Recommended)
                        </SelectItem>
                        <SelectItem value="Level AAA (Enhanced)">Level AAA (Enhanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Alt Text Generation</Label>
                      <Switch checked={altText} onCheckedChange={setAltText} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generate descriptions for images
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Screen Reader Optimization</Label>
                      <Switch checked={screenReader} onCheckedChange={setScreenReader} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Structure content for assistive technology
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Color Contrast Check</Label>
                      <Switch checked={colorContrast} onCheckedChange={setColorContrast} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ensure 4.5:1 minimum contrast ratio
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Dyslexia-Friendly Font</Label>
                      <Switch checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use OpenDyslexic or similar fonts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Closed Captions</Label>
                      <Switch checked={closedCaptions} onCheckedChange={setClosedCaptions} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Generate captions for all video content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Universal Design for Learning</CardTitle>
                <CardDescription>UDL framework implementation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-sm mb-3">Multiple Means of Representation</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Text, audio, and visual alternatives
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Adjustable font sizes and colors
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Vocabulary support and glossaries
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-sm mb-3">
                      Multiple Means of Action & Expression
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Varied response formats available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Scaffolds for planning and organizing
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          Assistive technology integration
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="font-medium text-sm mb-3">Multiple Means of Engagement</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Choice and autonomy options
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Relevance to student interests
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Appropriate challenge levels
                        </span>
                      </div>
                    </div>
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
