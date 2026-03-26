from app.models.schemas import GenerateRequest




# Build the generation prompt directly from structured frontend inputs
def build_generation_prompt(req: GenerateRequest, rag_pack: str) -> str:
    objectives_text = "\n".join(
        f"{idx + 1}. [{obj.bloom_level}] {obj.text}"
        for idx, obj in enumerate(req.objectives)
    ) if req.objectives else "None provided"

    match req.deliverable_type:
        case "Quiz":
            return f"""
Create a student-facing quiz.

Context:
Subject: {req.subject}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following curriculum/standards information as grounding:
{rag_pack}

Requirements:
- The output must be a clean student-facing quiz only.
- Do not include teacher notes.
- Do not include standards in the quiz itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the quiz classroom-ready and age-appropriate.
- Include an answer key at the end.
- Prefer mostly multiple-choice questions unless the topic strongly requires otherwise.
- Keep the formatting clean and consistent.
- Do not repeat questions.
- Do not duplicate numbering.
- Do not include explanations in the question section.

Output format:
TITLE

Name: _________________________    Date: _________________________

Instructions:
Choose the best answer for each question.

1. Question text
   a) Option
   b) Option
   c) Option
   d) Option

2. Question text
   a) Option
   b) Option
   c) Option
   d) Option

3. Continue in the same format for the remaining questions.

---

Answer Key:

1. Correct letter
2. Correct letter
3. Continue in the same format

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
- Keep the answer key separate from the quiz questions.
            """.strip()
        
        case "Exam":
            return f"""

            """.strip()
        

        case "Homework":
            return f"""
Create a student-facing homework assignment.

Context:
Subject: {req.subject}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following curriculum/standards information as grounding:
{rag_pack}

Requirements:
- The output must be a clean student-facing homework assignment only.
- Do not include teacher notes.
- Do not include standards in the homework itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the assignment classroom-ready and age-appropriate.
- Include an answer key at the end.
- Use a mix of question types when appropriate, such as short answer, application, and problem solving.
- Keep the formatting clean and consistent.
- Do not repeat questions.
- Do not duplicate numbering.

Output format:
TITLE

Name: _________________________    Date: _________________________

Instructions:
Complete all questions. Show your work where applicable.

1. Question text

2. Question text

3. Question text

4. Continue in the same format for the remaining questions.

---

Answer Key:

1. Correct response, sample response, or worked answer
2. Correct response, sample response, or worked answer
3. Continue in the same format

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
- Keep the answer key separate from the homework questions.
- For open-ended questions, provide concise sample answers rather than long teacher commentary.
            """.strip()
        

        case "Lesson Plan": # RESEARCH WHAT MAKES A GOOD LESSON PLAN + PUT IN RAG
            return f"""
Create a teacher-facing lesson plan.

Context:
Subject: {req.subject}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following curriculum/standards information as grounding:
{rag_pack}

Requirements:
- The output must be a teacher-facing lesson plan only.
- Do not include student worksheet formatting unless it is part of the lesson procedure.
- Do not include standards in the lesson plan itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the lesson plan realistic, classroom-ready, and age-appropriate.
- Include clear pacing and instructional flow.
- Include differentiation or accommodations when the classroom context suggests it.
- Keep the formatting clean and consistent.

Output format:
TITLE

Grade Level: __________
Subject: __________
Duration: __________ minutes

Objectives:
- Objective 1
- Objective 2

Materials:
- Material 1
- Material 2

Lesson Overview:
A brief paragraph describing the purpose and focus of the lesson.

Lesson Procedure:

1. Introduction
   - Clear teacher-facing steps

2. Direct Instruction
   - Clear teacher-facing steps

3. Guided Practice
   - Clear teacher-facing steps

4. Independent Practice
   - Clear teacher-facing steps

5. Closure
   - Clear teacher-facing steps

Assessment:
- How student understanding will be checked

Differentiation:
- Supports, accommodations, or modifications

Optional Homework or Extension:
- If appropriate, include a short follow-up task

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
- Use teacher-facing language such as "Students will..." and "Teacher will..."
- Do not include an answer key unless the lesson explicitly contains assessment items that require one.
            """.strip()
        
        
        case "Activity":
            return f"""
            """.strip()


    return f"""
Create a {req.deliverable_type.lower()} for the following classroom scenario.

Subject: {req.subject}
Lesson Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or 'None provided'}

Learning Objectives:
{objectives_text}

Use the following standards/context from the RAG corpus:
{rag_pack}

Requirements:
- Align the deliverable to the lesson topic and objectives.
- Use only the RAG pack for standards and official requirements.
- Keep the content age-appropriate and classroom-ready.
- If the deliverable is a quiz, exam, or homework, include an answer key.
- If the deliverable is a lesson plan, include clear instructional structure.
""".strip()