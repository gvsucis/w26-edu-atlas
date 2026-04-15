from google.genai import types
from pydantic import BaseModel, Field # Enforce data structures
from typing import List, Optional, Literal

# Turn raw JSON into a python object
class LearningObjectiveInput(BaseModel):
    bloom_level: str
    text: str = Field(min_length=1)

class GenerateRequest(BaseModel):
    subject: str
    grade_band: Literal["K-2", "3-5", "6-8", "9-12"]
    lesson_topic: str
    duration_minutes: int
    classroom_context: Optional[str] = ""
    deliverable_type: Literal[
        "Exam",
        "Quiz",
        "Homework",
        "Lesson Plan",
        "Activity",
        "Worksheet",
    ]
    objectives: List[LearningObjectiveInput]

# Structure eval output
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

# Structure standards output
RETRIEVAL_SCHEMA = types.Schema(
    type="OBJECT",
    properties={
        "standards": types.Schema(
            type="ARRAY",
            items=types.Schema(
                type="OBJECT",
                properties={
                    "code": types.Schema(type="STRING"),
                    "title": types.Schema(type="STRING"),
                    "excerpt": types.Schema(type="STRING"),
                },
                required=["code", "title", "excerpt"],
            ),
        ),
        "notes": types.Schema(type="STRING"),
    },
    required=["standards", "notes"],
)