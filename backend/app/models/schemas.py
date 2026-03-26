from google.genai import types
from pydantic import BaseModel
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Uses google's types.Schema to structure Gemini I/O
PLAN_SCHEMA = types.Schema(
    type="OBJECT",
    properties={
        "grade_band": types.Schema(type="STRING"),
        "grade": types.Schema(type="STRING"),
        "subject": types.Schema(type="STRING"),
        "deliverable_type": types.Schema(type="STRING"),
        "standards_needed": types.Schema(type="BOOLEAN"),
        "needs_web_search": types.Schema(type="BOOLEAN"),
        "rag_queries": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
        "generation_constraints": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
    },
    required=[
        "grade_band",
        "subject",
        "deliverable_type",
        "standards_needed",
        "needs_web_search",
        "rag_queries",
        "generation_constraints",
    ],
)

EVAL_SCHEMA = types.Schema(
    type="OBJECT",
    properties={
        "structure_ok": types.Schema(type="BOOLEAN"),
        "grounding_score": types.Schema(type="NUMBER"),
        "constraint_score": types.Schema(type="NUMBER"),
        "age_appropriateness_score": types.Schema(type="NUMBER"),
        "overall_score": types.Schema(type="NUMBER"),
        "issues": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
        "should_regenerate": types.Schema(type="BOOLEAN"),
    },
    required=[
        "structure_ok",
        "grounding_score",
        "constraint_score",
        "age_appropriateness_score",
        "overall_score",
        "issues",
        "should_regenerate",
    ],
)


class LearningObjectiveInput(BaseModel):
    bloom_level: str
    text: str = Field(min_length=1)


class GenerateRequest(BaseModel):
    subject: str
    lesson_topic: str
    duration_minutes: int
    classroom_context: Optional[str] = ""
    deliverable_type: Literal[
        "Exam",
        "Quiz",
        "Homework",
        "Lesson Plan",
        "Activity",
        "Worksheet"
    ]
    objectives: List[LearningObjectiveInput]


class GenerateResponse(BaseModel):
    output: str
    validation: dict
    plan: dict