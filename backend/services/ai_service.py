"""
AI service for Google Gemini integration
"""

import json
import logging
from typing import Dict, Any, List
from google import genai
from config import settings
from models.trip import TripGenerationRequest
from utils.cache import cache_result

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered trip generation using Google Gemini"""

    def __init__(self):
        self.client = genai.Client(api_key=settings.google_gemini_api_key)

    @cache_result(ttl=3600)  # Cache for 1 hour
    async def generate_itinerary(self, request: TripGenerationRequest) -> Dict[str, Any]:
        """Generate a comprehensive travel itinerary using AI"""

        prompt = self._build_prompt(request)

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            itinerary_data = self._parse_response(response.text)

            # Validate and structure the response
            validated_itinerary = self._validate_itinerary(itinerary_data)

            return {
                "success": True,
                "itinerary": validated_itinerary,
                "image_queries": self._extract_image_queries(validated_itinerary)
            }

        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            raise Exception(f"Failed to generate itinerary: {str(e)}")

    def _build_prompt(self, request: TripGenerationRequest) -> str:
        """Build the AI prompt for itinerary generation"""

        preferences_text = ""
        if request.preferences:
            prefs = []
            if request.preferences.adventure:
                prefs.append("adventure activities")
            if request.preferences.culture:
                prefs.append("cultural experiences")
            if request.preferences.relaxation:
                prefs.append("relaxation and wellness")
            if request.preferences.classical:
                prefs.append("classical sightseeing")
            if request.preferences.shopping:
                prefs.append("shopping experiences")
            if request.preferences.food:
                prefs.append("food and cuisine")
            preferences_text = f" with focus on: {', '.join(prefs)}" if prefs else ""

        budget_text = f" with budget around ₹{request.budget}" if request.budget else ""

        prompt = f"""
        Generate a comprehensive {request.duration_days}-day travel itinerary for {request.destination} starting from {request.start_date}.

        Trip Details:
        - Destination: {request.destination}
        - Duration: {request.duration_days} days
        - Start Date: {request.start_date}
        - Starting Location: {request.start_location or 'Not specified'}
        - International Trip: {request.is_international}
        - Preferences: {preferences_text}
        - Budget: {budget_text}

        Please provide a detailed JSON response with the following structure:
        {{
            "title": "Trip to [Destination]",
            "destination": "[Destination]",
            "duration_days": {request.duration_days},
            "start_date": "{request.start_date}",
            "estimated_total_cost": "₹XXXXX",
            "best_time_to_visit": "[Best time]",
            "travel_tips": ["Tip 1", "Tip 2", "Tip 3"],
            "daily_plans": [
                {{
                    "day": 1,
                    "date": "[Date]",
                    "theme": "[Theme]",
                    "activities": [
                        {{
                            "time": "10:00 AM",
                            "activity": "[Activity Name]",
                            "location": "[Location]",
                            "description": "[Description]",
                            "estimated_cost": "₹XXX",
                            "duration": "X hours",
                            "image_search_query": "[Short query]",
                            "booking_info": {{
                                "required": true/false,
                                "url": "[URL]",
                                "price_range": "₹XXX-XXX"
                            }}
                        }}
                    ]
                }}
            ],
            "accommodation": [
                {{
                    "name": "[Hotel Name]",
                    "type": "[Type]",
                    "price_range": "₹XXX-XXX/night",
                    "rating": "X.X/5",
                    "location": "[Location]",
                    "booking_url": "[URL]",
                    "amenities": ["Amenity 1", "Amenity 2"]
                }}
            ],
            "transportation": [
                {{
                    "type": "[Type]",
                    "from": "[From]",
                    "to": "[To]",
                    "estimated_cost": "₹XXXX",
                    "duration": "X hours",
                    "booking_url": "[URL]"
                }}
            ],
            "neighboring_places": [
                {{
                    "name": "[Place Name]",
                    "distance": "[Distance]",
                    "description": "[Description]",
                    "time_to_reach": "[Time]",
                    "best_known_for": "[Known for]",
                    "estimated_cost": "₹XXX",
                    "image_search_query": "[Query]"
                }}
            ]
        }}

        Requirements:
        1. All costs must be in Indian Rupees (₹)
        2. Include realistic time slots with no overlapping activities
        3. Provide booking URLs for major attractions
        4. Generate short, specific image search queries (1-2 words)
        5. Include travel tips and best time to visit
        6. Suggest neighboring places within 50-150km
        7. Ensure activities align with user preferences{budget_text}
        """

        return prompt

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and extract JSON"""
        try:
            # Clean the response text
            cleaned_text = response_text.strip()

            # Remove markdown code blocks if present
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]

            cleaned_text = cleaned_text.strip()

            # Parse JSON
            return json.loads(cleaned_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Response text: {response_text}")
            raise Exception("Invalid response format from AI service")

    def _validate_itinerary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the itinerary data"""
        # Ensure required fields exist
        required_fields = [
            "title", "destination", "duration_days", "start_date",
            "estimated_total_cost", "best_time_to_visit", "travel_tips",
            "daily_plans", "accommodation", "transportation"
        ]

        for field in required_fields:
            if field not in data:
                data[field] = self._get_default_value(field)

        # Validate daily plans and convert any date objects to strings
        if "daily_plans" in data and isinstance(data["daily_plans"], list):
            for plan in data["daily_plans"]:
                if "activities" not in plan:
                    plan["activities"] = []
                # Convert date fields to strings if they exist
                if "date" in plan and hasattr(plan["date"], 'isoformat'):
                    plan["date"] = plan["date"].isoformat()

        # Convert start_date to string if it's a date object
        if "start_date" in data and hasattr(data["start_date"], 'isoformat'):
            data["start_date"] = data["start_date"].isoformat()

        return data

    def _get_default_value(self, field: str) -> Any:
        """Get default values for missing fields"""
        defaults = {
            "title": "Custom Trip",
            "destination": "Unknown",
            "duration_days": 1,
            "start_date": "2025-01-01",
            "estimated_total_cost": "₹0",
            "best_time_to_visit": "Anytime",
            "travel_tips": ["Check weather conditions", "Pack essentials"],
            "daily_plans": [],
            "accommodation": [],
            "transportation": [],
            "neighboring_places": []
        }
        return defaults.get(field, [])

    def _extract_image_queries(self, itinerary: Dict[str, Any]) -> List[str]:
        """Extract image search queries from itinerary"""
        queries = []

        # Add destination query
        if "destination" in itinerary:
            queries.append(f"{itinerary['destination']} tourism")

        # Add activity queries
        if "daily_plans" in itinerary:
            for plan in itinerary["daily_plans"]:
                if "activities" in plan:
                    for activity in plan["activities"]:
                        if "image_search_query" in activity:
                            queries.append(activity["image_search_query"])

        # Add neighboring places queries
        if "neighboring_places" in itinerary:
            for place in itinerary["neighboring_places"]:
                if "image_search_query" in place:
                    queries.append(place["image_search_query"])

        # Remove duplicates and limit
        unique_queries = list(set(queries))
        return unique_queries[:10]  # Limit to 10 queries


# Global AI service instance
ai_service = AIService()
