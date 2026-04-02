from app.models.schemas import GenerateRequest

# Grabs standards from retrieval and formats them for the report
def build_standards_grounding_block(retrieval_result: dict) -> str:
    standards = retrieval_result.get("standards", [])
    if not standards:
        return "No standards retrieved."

    return "\n".join(f"- {std['code']}: {std['title']}" for std in standards)


# Build objective text block from structured objectives
def build_objectives_block(req: GenerateRequest) -> str:
    if not req.objectives:
        return "None provided"

    return "\n".join(
        f"{idx + 1}. [{obj.bloom_level}] {obj.text}"
        for idx, obj in enumerate(req.objectives)
    )


def build_quiz_prompt(req: GenerateRequest, retrieval_result: dict) -> str:
    objectives_text = build_objectives_block(req)
    standards_block = build_standards_grounding_block(retrieval_result)

    return f"""
Create a student-facing quiz.

Context: {req.classroom_context}
Subject: {req.subject}
Grade Band: {req.grade_band}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following standards as hidden grounding only:
{standards_block}

Requirements:
- The output must be a clean student-facing quiz only.
- Do not include teacher notes.
- Do not include standards codes or titles in the quiz itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the quiz classroom-ready and age-appropriate.
- Include an answer key at the end.
- Prefer mostly multiple-choice questions unless the topic strongly requires otherwise.
- Do not repeat questions.
- Do not duplicate numbering.

Output format:
Title

Name: _________________________    Date: _________________________

Instructions:
Choose the best answer for each question.

1. Question text
   a) Option
   b) Option
   c) Option
   d) Option

2. Continue in the same format.

---

Answer Key:

1. Correct letter
2. Correct letter

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
""".strip()


def build_homework_prompt(req: GenerateRequest, retrieval_result: dict) -> str:
    objectives_text = build_objectives_block(req)
    standards_block = build_standards_grounding_block(retrieval_result)

    return f"""
Create a student-facing homework assignment.

Context: {req.classroom_context}
Subject: {req.subject}
Grade Band: {req.grade_band}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following standards as hidden grounding only:
{standards_block}

Requirements:
- The output must be a clean student-facing homework assignment only.
- Do not include teacher notes.
- Do not include standards codes or titles in the homework itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the assignment classroom-ready and age-appropriate.
- Include an answer key at the end.
- Use a mix of question types when appropriate, such as short answer, application, and problem solving.
- Do not repeat questions.
- Do not duplicate numbering.

Output format:
Title

Name: _________________________    Date: _________________________

Instructions:
Complete all questions. Show your work where applicable.

1. Question text

2. Question text

3. Continue in the same format.

---

Answer Key:

1. Correct response, sample response, or worked answer
2. Correct response, sample response, or worked answer

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
""".strip()


def build_lesson_plan_prompt(req: GenerateRequest, retrieval_result: dict) -> str:
    objectives_text = build_objectives_block(req)
    standards_block = build_standards_grounding_block(retrieval_result)

    return f"""
Create a teacher-facing lesson plan.

Context: {req.classroom_context}
Subject: {req.subject}
Grade Band: {req.grade_band}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following standards as hidden grounding only:
{standards_block}

Requirements:
- The output must be a teacher-facing lesson plan only.
- Do not include standards codes or titles in the lesson plan itself.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Make the lesson plan realistic, classroom-ready, and age-appropriate.
- Include clear pacing and instructional flow.
- Include differentiation when classroom context suggests it.

Output format:
Title

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
A brief paragraph describing the lesson.

Lesson Procedure:

1. Introduction
   - Teacher-facing steps

2. Direct Instruction
   - Teacher-facing steps

3. Guided Practice
   - Teacher-facing steps

4. Independent Practice
   - Teacher-facing steps

5. Closure
   - Teacher-facing steps

Assessment:
- How student understanding will be checked

Differentiation:
- Supports, accommodations, or modifications

Optional Homework or Extension:
- If appropriate

Additional formatting rules:
- Use plain text only.
- Do not use markdown symbols like ** or ###.
- Put exactly one blank line between major sections.
""".strip()


# Build the generation prompt based on deliverable type
def build_generation_prompt(req: GenerateRequest, retrieval_result: dict) -> str:
    if req.deliverable_type == "Quiz":
        return build_quiz_prompt(req, retrieval_result)

    if req.deliverable_type == "Homework":
        return build_homework_prompt(req, retrieval_result)

    if req.deliverable_type == "Lesson Plan":
        return build_lesson_plan_prompt(req, retrieval_result)

    objectives_text = build_objectives_block(req)
    standards_block = build_standards_grounding_block(retrieval_result)

# Generic fallback structure TODO: Complete structure for every deliverable type
    return f"""
Create a classroom-ready {req.deliverable_type.lower()}.

Context: {req.classroom_context}
Subject: {req.subject}
Grade Band: {req.grade_band}
Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or "None provided"}

Learning Objectives:
{objectives_text}

Use the following standards as hidden grounding only:
{standards_block}

Requirements:
- Make the output classroom-ready and age-appropriate.
- Do not include standards codes or titles in the final deliverable.
- Do not mention AI, validation, curriculum metadata, or planning notes.
- Use plain text only.
""".strip()