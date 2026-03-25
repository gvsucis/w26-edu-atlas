from app.models.schemas import GenerateRequest

# Convert structured frontend data into a normalized internal prompt
def build_user_request(req: GenerateRequest) -> str:
    objectives_text = "\n".join(
        f"{idx + 1}. [{obj.bloom_level}] {obj.text}"
        for idx, obj in enumerate(req.objectives)
    ) if req.objectives else "None provided"

    return f"""
Create a {req.deliverable_type.lower()} for the following classroom scenario.

Subject: {req.subject}
Grade: {req.grade}
Lesson Topic: {req.lesson_topic}
Duration: {req.duration_minutes} minutes
Classroom Context: {req.classroom_context or 'None provided'}

Learning Objectives:
{objectives_text}

Generate a {req.deliverable_type.lower()} aligned to the lesson topic and objectives.
""".strip()