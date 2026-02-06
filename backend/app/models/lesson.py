from dataclasses import dataclass

"""
Data Transfer Object for incoming lesson generation requests.
Validates and structures data from the frontend.
"""

@dataclass
# Data structure for incoming lesson request from frontend
class LessonRequest:
    subject: str              # "Math", "Science"
    concept: str              # "Photosynthesis"
    concepts_count: int       # Number of new concepts introduced each lesson
    grade_level: str          # "5", "college"

@dataclass
# Data structure for lesson plan response to frontend
class LessonPlan:
    title: str
    subject: str
    concept: str
    grade_level: str
    content: str              # The generated lesson plan