import logging
from typing import Dict, Any
from config import settings
from models.trip import TripGenerationRequest
from utils.cache import cache_result
from services.helpers.ai_prompt_builder import AIPromptBuilder
from services.helpers.ai_response_parser import (
    AIResponseParser,
    AIItineraryValidator,
    AIItineraryProcessor
)

logger = logging.getLogger(__name__)

try:
    # Provided by the `google-genai` package
    from google import genai  # type: ignore
except Exception as e:
    genai = None
    logger.warning(f"google-genai not available; AI features disabled. Import error: {e}")


class AIService:

    def __init__(self):
        if settings.disable_ai:
            raise RuntimeError("AI is disabled (DISABLE_AI=true).")
        if genai is None:
            raise RuntimeError("google-genai SDK not installed or failed to import.")
        if not settings.google_gemini_api_key:
            raise RuntimeError("GOOGLE_GEMINI_API_KEY is not set.")

        self.client = genai.Client(api_key=settings.google_gemini_api_key)
        self.prompt_builder = AIPromptBuilder()
        self.response_parser = AIResponseParser()
        self.itinerary_validator = AIItineraryValidator()
        self.itinerary_processor = AIItineraryProcessor()

    @cache_result(ttl=3600)  # Cache for 1 hour
    async def generate_itinerary(self, request: TripGenerationRequest) -> Dict[str, Any]:

        prompt = self.prompt_builder.build_itinerary_prompt(request)

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            itinerary_data = self.response_parser.parse_json_response(response.text)

            # Validate and structure the response
            validated_itinerary = self.itinerary_validator.validate_itinerary(itinerary_data)

            # Set generic themes for daily plans
            self.itinerary_processor.set_generic_themes(validated_itinerary)

            return {
                "success": True,
                "itinerary": validated_itinerary
            }

        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            raise Exception(f"Failed to generate itinerary: {str(e)}")

    async def generate_single_activity(
        self,
        destination: str,
        activity_name: str,
        time_slot: str,
        duration: str,
        preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:

        prompt = self.prompt_builder.build_single_activity_prompt(
            destination, activity_name, time_slot, duration, preferences
        )

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            activity_data = self.response_parser.parse_json_response(response.text)

            return {
                "success": True,
                "activity": activity_data
            }

        except Exception as e:
            logger.error(f"Error generating single activity: {str(e)}")
            raise Exception(f"Failed to generate activity: {str(e)}")

    async def generate_alternative_activities(
        self,
        destination: str,
        original_activity: Dict[str, Any],
        time_slot: str,
        duration: str,
        preferences: Dict[str, Any] = None,
        num_alternatives: int = 3
    ) -> Dict[str, Any]:

        prompt = self.prompt_builder.build_alternative_activities_prompt(
            destination, original_activity, time_slot, duration, preferences, num_alternatives
        )

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            response_data = self.response_parser.parse_json_response(response.text)

            # Extract alternatives array from response
            alternatives = response_data.get("alternatives", [])

            if not alternatives:
                logger.warning("No alternatives generated, returning empty list")
                return {
                    "success": True,
                    "alternatives": []
                }

            return {
                "success": True,
                "alternatives": alternatives
            }

        except Exception as e:
            logger.error(f"Error generating alternative activities: {str(e)}")
            raise Exception(f"Failed to generate alternatives: {str(e)}")

    async def generate_accommodation_details(
        self,
        location: str,
        destination: str
    ) -> Dict[str, Any]:
        """Generate accommodation details for a specific location"""

        prompt = self.prompt_builder.build_accommodation_details_prompt(location, destination)

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            
            # Check if response has text
            if not response or not response.text:
                logger.error("AI response is empty or has no text")
                raise Exception("AI response is empty")
            
            accommodation_data = self.response_parser.parse_json_response(response.text)

            return {
                "success": True,
                "accommodation": accommodation_data
            }

        except Exception as e:
            logger.error(f"Error generating accommodation details: {str(e)}")
            raise Exception(f"Failed to generate accommodation details: {str(e)}")

    async def generate_trip_summary(
        self,
        trip_title: str,
        destination: str,
        duration_days: int,
        itinerary_data: Dict[str, Any]
    ) -> str:
        """Generate a concise trip summary (under 200 words)"""

        prompt = f"""Generate a concise, engaging summary of this trip in under 200 words. 
The summary should capture the essence of the trip, highlighting key experiences and destinations.

Trip Details:
- Title: {trip_title}
- Destination: {destination}
- Duration: {duration_days} days

Daily Plans Summary:
"""
        # Add brief overview of daily plans
        if "daily_plans" in itinerary_data:
            for day in itinerary_data["daily_plans"][:3]:  # Include first 3 days
                day_num = day.get("day", "")
                activities = day.get("activities", [])
                activity_names = ", ".join([a.get("name", "") for a in activities[:2]])
                prompt += f"\n- Day {day_num}: {activity_names}"

        prompt += "\n\nWrite an engaging summary that would excite travelers about this trip. Focus on the experiences, culture, and highlights."

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            
            if not response or not response.text:
                logger.error("AI response is empty or has no text")
                return "Experience an unforgettable journey filled with adventure, culture, and memorable moments."
            
            # Strip word count pattern like "(89 words)" from the end
            summary = response.text.strip()
            import re
            summary = re.sub(r'\s*\(\d+\s+words?\)\s*$', '', summary, flags=re.IGNORECASE)
            
            return summary

        except Exception as e:
            logger.error(f"Error generating trip summary: {str(e)}")
            return "Experience an unforgettable journey filled with adventure, culture, and memorable moments."


# Global AI service instance
try:
    ai_service = AIService()
except Exception as e:
    logger.warning(f"AIService not initialized (running without AI): {e}")
    ai_service = None
