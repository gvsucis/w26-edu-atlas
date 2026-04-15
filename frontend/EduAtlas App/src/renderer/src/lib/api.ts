// Backend communication layer
// The interfaces are basically classes: they are the structure of the data that the frontend will use
export interface LearningObjectiveInput {
  bloom_level: string
  text: string
}

export interface GenerateRequest {
  subject: string
  grade_band: 'K-2' | '3-5' | '6-8' | '9-12'
  lesson_topic: string
  duration_minutes: number
  classroom_context: string
  deliverable_type: 'Exam' | 'Quiz' | 'Homework' | 'Lesson Plan' | 'Activity' | 'Worksheet'
  objectives: LearningObjectiveInput[]
  use_web_search: boolean
}

export interface GenerateResponse {
  deliverable: {
    content: string
    type?: string
  }
  validation: {
    report: string
    raw?: Record<string, unknown>
    success: boolean
    attempts_used: number
    message?: string
  }
  metadata?: {
    plan?: Record<string, unknown>
  }
}

// This is where the frontend recieves the generated payload
export async function generateContent(payload: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch('http://127.0.0.1:8000/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend error (${res.status}): ${text}`)
  }

  return res.json()
}