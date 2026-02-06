from flask import Blueprint, request, jsonify
from dataclasses import asdict
from app.services.lesson_service import LessonService
from app.mappers.lesson_mapper import LessonMapper

"""
Controller for incoming HTTP requests and responses
"""

# Groups /api prefix for all endpoints
api = Blueprint('api', __name__)

# Initialize dependencies
lesson_service = LessonService()
lesson_mapper = LessonMapper()

# Health check to verify API is running
@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Generate a lesson plan from user input
@api.route('/generate-lesson', methods=['POST'])
async def generate_lesson():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body must be JSON"}), 400
        
        lesson_request = lesson_mapper.to_lesson_request(data)
        lesson_plan = await lesson_service.generate_lesson(lesson_request)
        response = asdict(lesson_plan)
                
        return jsonify(response), 200
    
    except KeyError as e:
        return jsonify({"message": f"Missing required field: {str(e)}"}), 400
        
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
        
    except Exception as e:
        return jsonify({"message": "An unexpected error has ocurred"}), 500