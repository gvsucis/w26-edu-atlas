from app.models.lesson import LessonRequest, LessonPlan
# Still need to train an AI model
from app.llm.client import LLMClient
from app.llm.prompts import LessonPrompts 

"""
Service layer for business logic such as validation
and AI model orchestration. 
Used by the controller to separate logic
"""

class LessonService:
    # Constructor initializes the AI
    def __init__(self):
        # Don't have an AI model yet
        self.llm_client = LLMClient()
    
    # Generates a lesson plan from user input
    async def generate_lesson(self, request: LessonRequest) -> LessonPlan:
        self._validate_request(request)
        
        prompt = LessonPrompts.build_lesson_prompt(
            subject=request.subject,
            concept=request.concept,
            concepts_count=request.concepts_count,
            grade_level=request.grade_level
        )
        
        generated_content = await self.llm_client.generate_lesson(prompt)
        
        lesson_plan = LessonPlan(
            title=f"{request.subject}: {request.concept}",
            subject=request.subject,
            concept=request.concept,
            grade_level=request.grade_level,
            content=generated_content
        )
        
        return lesson_plan
    
    # Validates the lesson request
    def _validate_request(self, request: LessonRequest) -> None:
        valid_grades = [str(i) for i in range(1, 13)] + ["college"]
        
        if not 1 <= request.concepts_count <= 20:
            raise ValueError(
                f"Invalid concepts_count '{request.concepts_count}'. "
                f"Must be between 1 and 20"
            )

        if request.grade_level not in valid_grades:
            raise ValueError(
                f"Invalid grade_level '{request.grade_level}'. "
                f"Must be 1-12 or 'college'"
            )
        
        if not request.concept or len(request.concept.strip()) == 0:
            raise ValueError("Concept cannot be empty")
        
        if len(request.concept) > 200:
            raise ValueError("Concept must be 200 characters or less")