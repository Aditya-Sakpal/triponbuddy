import logging
from typing import Dict, Any
from google import genai
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


class AIService:

    def __init__(self):
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

    async def estimate_minimum_budget(
        self,
        destinations: list[str],
        duration_days: int,
        start_date: str
    ) -> Dict[str, Any]:
        """Quickly estimate minimum budget per person for a trip"""
        
        destinations_text = " -> ".join(destinations)
        
        prompt = f"""Estimate a realistic budget per person in INR for this trip:
- Destinations: {destinations_text}
- Duration: {duration_days} days
- Start Date: {start_date}

Consider: accommodation (budget hotels), local transport, meals (budget-friendly), entry fees.
Respond with ONLY a JSON object: {{"minimum_budget": <number>}}"""

        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            budget_data = self.response_parser.parse_json_response(response.text)
            
            return {
                "success": True,
                "minimum_budget": budget_data.get("minimum_budget", 5000)
            }

        except Exception as e:
            logger.error(f"Error estimating budget: {str(e)}")
            # Return fallback budget based on duration
            fallback_budget = duration_days * 2000  # ₹2000 per day as fallback
            return {
                "success": True,
                "minimum_budget": fallback_budget
            }


# Global AI service instance
ai_service = AIService()
