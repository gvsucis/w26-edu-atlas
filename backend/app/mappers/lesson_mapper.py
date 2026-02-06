from app.models.lesson import LessonRequest, LessonPlan
from typing import Dict, Any

"""
Mappers for converting requests into models,
and models into Data Transfer objects for response.
"""

class LessonMapper:
    # Convert request to LessonRequest DTO
    @staticmethod
    def to_lesson_request(data: Dict[str, Any]) -> LessonRequest:
        return LessonRequest(
            subject=data['subject'],
            concept=data['concept'],
            concepts_count=int(data['concepts_count']),
            grade_level=data['grade_level']
        )