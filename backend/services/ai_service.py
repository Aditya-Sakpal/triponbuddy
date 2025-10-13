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

            # Set generic themes for daily plans
            self._set_generic_themes(validated_itinerary)

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
                            "description": "[Brief description in 1-2 sentences]",
                            "detailed_description": "[Detailed description in 3-4 paragraphs covering history, significance, visitor experience, tips, and interesting facts about this activity/location]",
                            "estimated_cost": "₹XXX",
                            "duration": "X hours",
                            "image_search_query": "[Short query]",
                            "booking_info": {{
                                "required": true/false,
                                "url": "[URL]",
                                "price_range": "₹XXX-XXX"
                            }},
                            "tag": "[arrival_departure/dining/sightseeing/shopping/entertainment/relaxation/adventure/cultural]",
                            "alternatives": ["Alternative Activity 1", "Alternative Activity 2", "Alternative Activity 3"]
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
            "transportation": {{
                "routes": [
                    {{
                        "type": "flight",
                        "from": "[Starting Location]",
                        "to": "[Destination]",
                        "estimated_cost": "₹XXXXX",
                        "duration": "X hours",
                        "booking_url": "[Flight booking URL]",
                        "details": "[Flight details, airlines, etc.]"
                    }},
                    {{
                        "type": "train",
                        "from": "[Starting Location]",
                        "to": "[Destination]",
                        "estimated_cost": "₹XXXXX",
                        "duration": "X hours",
                        "booking_url": "[Train booking URL]",
                        "details": "[Train details, routes, etc.]"
                    }},
                    {{
                        "type": "local",
                        "from": "[Starting Location]",
                        "to": "[Destination]",
                        "estimated_cost": "₹XXXXX",
                        "duration": "X hours",
                        "booking_url": "[Local transport booking URL]",
                        "details": "[Bus/car details, routes, etc.]"
                    }}
                ]
            }},
            "transportation_hubs_start": [
                {{
                    "name": "[Hub Name, e.g., Indira Gandhi International Airport]",
                    "type": "airport",
                    "location": "[Location]",
                    "distance_from_city": "[Distance]",
                    "estimated_cost_to_reach": "₹XXX",
                    "transportation_options": ["Taxi", "Metro", "Bus"]
                }}
            ],
            "transportation_hubs_destination": [
                {{
                    "name": "[Hub Name, e.g., Destination Airport/Railway Station]",
                    "type": "airport",
                    "location": "[Location]",
                    "distance_from_city": "[Distance]",
                    "estimated_cost_to_reach": "₹XXX",
                    "transportation_options": ["Taxi", "Metro", "Bus"]
                }}
            ],
            "local_transportation": [
                {{
                    "type": "taxi",
                    "description": "[Description of taxi services]",
                    "estimated_cost": "₹XXX",
                    "availability": "24/7",
                    "coverage_area": "[Areas covered]",
                    "booking_info": "[How to book]"
                }},
                {{
                    "type": "rickshaw",
                    "description": "[Description of rickshaw services]",
                    "estimated_cost": "₹XXX",
                    "availability": "[Availability hours]",
                    "coverage_area": "[Areas covered]",
                    "booking_info": "[How to book]"
                }},
                {{
                    "type": "metro",
                    "description": "[Description of metro system]",
                    "estimated_cost": "₹XXX",
                    "availability": "[Operating hours]",
                    "coverage_area": "[Areas covered]",
                    "booking_info": "[How to book tickets]"
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
        8. Provide exactly 3 transportation routes: one flight, one train, and one local transport option
        9. Include transportation hubs for both starting location and destination
        10. Provide comprehensive local transportation options for the destination
        11. Include realistic costs and practical details for all transportation options
        12. For each activity, provide both a brief description (1-2 sentences) and a detailed_description (3-4 paragraphs with rich information about history, significance, visitor experience, tips, and interesting facts)
        13. For each activity, assign an appropriate tag based on the activity type:
            - "arrival_departure" for airports, railway stations, check-in/check-out activities
            - "dining" for restaurants, cafes, food courts, breakfast/lunch/dinner activities
            - "sightseeing" for tourist attractions, monuments, viewpoints, landmarks
            - "shopping" for markets, malls, shopping districts, souvenir shops
            - "entertainment" for shows, performances, cinemas, nightlife
            - "relaxation" for spas, beaches, parks, leisure activities
            - "adventure" for trekking, water sports, adventure activities
            - "cultural" for museums, galleries, cultural centers, heritage sites
        14. For each activity, provide 3-5 alternative activities that could replace it in the same time slot, keeping similar duration and theme. These should be simple activity names as strings.
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

        # Validate transportation structure
        if "transportation" not in data or not isinstance(data["transportation"], dict):
            data["transportation"] = {"routes": []}
        elif "routes" not in data["transportation"]:
            data["transportation"]["routes"] = []

        # Ensure we have the 3 required route types
        route_types = ["flight", "train", "local"]
        existing_routes = [route.get("type", "").lower() for route in data["transportation"]["routes"]]
        for route_type in route_types:
            if route_type not in existing_routes:
                data["transportation"]["routes"].append(self._get_default_route(route_type))

        # Validate daily plans and convert any date objects to strings
        if "daily_plans" in data and isinstance(data["daily_plans"], list):
            for plan in data["daily_plans"]:
                if "activities" not in plan:
                    plan["activities"] = []
                # Convert date fields to strings if they exist
                if "date" in plan and hasattr(plan["date"], 'isoformat'):
                    plan["date"] = plan["date"].isoformat()

        # Initialize optional fields if missing
        optional_fields = ["transportation_hubs_start", "transportation_hubs_destination", "local_transportation"]
        for field in optional_fields:
            if field not in data:
                data[field] = []

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
            "transportation": {"routes": []},
            "transportation_hubs_start": [],
            "transportation_hubs_destination": [],
            "local_transportation": [],
            "neighboring_places": []
        }
        return defaults.get(field, [])

    def _get_default_route(self, route_type: str) -> Dict[str, Any]:
        """Get default route for missing transportation types"""
        defaults = {
            "flight": {
                "type": "flight",
                "from": "Starting Location",
                "to": "Destination",
                "estimated_cost": "₹5000-15000",
                "duration": "2-5 hours",
                "booking_url": "https://www.makemytrip.com/flights",
                "details": "Flight options available"
            },
            "train": {
                "type": "train",
                "from": "Starting Location",
                "to": "Destination",
                "estimated_cost": "₹500-3000",
                "duration": "5-24 hours",
                "booking_url": "https://www.irctc.co.in",
                "details": "Train options available"
            },
            "local": {
                "type": "local",
                "from": "Starting Location",
                "to": "Destination",
                "estimated_cost": "₹200-1000",
                "duration": "4-12 hours",
                "booking_url": "https://www.redbus.in",
                "details": "Bus/car options available"
            }
        }
        return defaults.get(route_type, defaults["local"])

    def _set_generic_themes(self, itinerary: Dict[str, Any]) -> None:
        """Set generic themes for daily plans based on day number"""
        if "daily_plans" not in itinerary or not isinstance(itinerary["daily_plans"], list):
            return

        duration_days = itinerary.get("duration_days", len(itinerary["daily_plans"]))

        for plan in itinerary["daily_plans"]:
            day = plan.get("day", 1)

            if day == 1:
                plan["theme"] = "Arrival Day"
            elif day == duration_days:
                plan["theme"] = "Departure Day"
            else:
                # Alternate between Exploration and Discovery for middle days
                if (day - 1) % 2 == 0:
                    plan["theme"] = "Exploration Day"
                else:
                    plan["theme"] = "Discovery Day"

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

    async def generate_single_activity(
        self, 
        destination: str, 
        activity_name: str, 
        time_slot: str,
        duration: str,
        preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate a single replacement activity with full details"""

        preferences_text = ""
        if preferences:
            prefs = []
            if preferences.get('adventure'):
                prefs.append("adventure activities")
            if preferences.get('culture'):
                prefs.append("cultural experiences")
            if preferences.get('relaxation'):
                prefs.append("relaxation and wellness")
            if preferences.get('classical'):
                prefs.append("classical sightseeing")
            if preferences.get('shopping'):
                prefs.append("shopping experiences")
            if preferences.get('food'):
                prefs.append("food and cuisine")
            preferences_text = f" with focus on: {', '.join(prefs)}" if prefs else ""

        prompt = f"""
        Generate a detailed activity entry for a trip to {destination}.

        Activity Details:
        - Activity Name: {activity_name}
        - Time Slot: {time_slot}
        - Duration: {duration}
        - Destination: {destination}
        - Preferences: {preferences_text}

        Please provide a detailed JSON response with the following structure:
        {{
            "time": "{time_slot}",
            "activity": "{activity_name}",
            "location": "[Specific location in {destination}]",
            "description": "[Brief description in 1-2 sentences]",
            "detailed_description": "[Detailed description in 3-4 paragraphs covering history, significance, visitor experience, tips, and interesting facts about this activity/location]",
            "estimated_cost": "₹XXX",
            "duration": "{duration}",
            "image_search_query": "[Short query for this activity]",
            "booking_info": {{
                "required": true/false,
                "url": "[URL if applicable]",
                "price_range": "₹XXX-XXX"
            }},
            "tag": "[arrival_departure/dining/sightseeing/shopping/entertainment/relaxation/adventure/cultural]",
            "alternatives": ["Alternative Activity 1", "Alternative Activity 2", "Alternative Activity 3"]
        }}

        Requirements:
        1. All costs must be in Indian Rupees (₹)
        2. Provide realistic booking URLs for major attractions
        3. Generate a short, specific image search query (1-2 words)
        4. Provide both a brief description (1-2 sentences) and a detailed_description (3-4 paragraphs)
        5. Assign an appropriate tag based on the activity type:
            - "arrival_departure" for airports, railway stations, check-in/check-out activities
            - "dining" for restaurants, cafes, food courts, breakfast/lunch/dinner activities
            - "sightseeing" for tourist attractions, monuments, viewpoints, landmarks
            - "shopping" for markets, malls, shopping districts, souvenir shops
            - "entertainment" for shows, performances, cinemas, nightlife
            - "relaxation" for spas, beaches, parks, leisure activities
            - "adventure" for trekking, water sports, adventure activities
            - "cultural" for museums, galleries, cultural centers, heritage sites
        6. Provide 3-5 alternative activities that could replace it in the same time slot
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            activity_data = self._parse_response(response.text)

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
        """Generate multiple alternative activities with full details"""

        preferences_text = ""
        if preferences:
            prefs = []
            if preferences.get('adventure'):
                prefs.append("adventure activities")
            if preferences.get('culture'):
                prefs.append("cultural experiences")
            if preferences.get('relaxation'):
                prefs.append("relaxation and wellness")
            if preferences.get('classical'):
                prefs.append("classical sightseeing")
            if preferences.get('shopping'):
                prefs.append("shopping experiences")
            if preferences.get('food'):
                prefs.append("food and cuisine")
            preferences_text = f" with focus on: {', '.join(prefs)}" if prefs else ""

        prompt = f"""
        Generate {num_alternatives} alternative activities for a trip to {destination} that can replace the following activity:

        Original Activity:
        - Name: {original_activity.get('activity', '')}
        - Location: {original_activity.get('location', '')}
        - Description: {original_activity.get('description', '')}
        - Time Slot: {time_slot}
        - Duration: {duration}
        - Tag: {original_activity.get('tag', 'sightseeing')}

        Requirements:
        - The alternatives should be in the same location/area (within {destination})
        - They should fit in the same time slot ({time_slot}) and duration ({duration})
        - They should offer different experiences while maintaining similar appeal
        - Consider the original activity's tag ({original_activity.get('tag', 'sightseeing')}) to suggest similar types of activities
        {preferences_text}

        Please provide a JSON response with an array of {num_alternatives} alternative activities, each with the following structure:
        {{
            "alternatives": [
                {{
                    "time": "{time_slot}",
                    "activity": "[Alternative activity name]",
                    "location": "[Specific location in {destination}]",
                    "description": "[Brief description in 1-2 sentences]",
                    "detailed_description": "[Detailed description in 3-4 paragraphs covering history, significance, visitor experience, tips, and interesting facts about this activity/location]",
                    "estimated_cost": "₹XXX",
                    "duration": "{duration}",
                    "image_search_query": "[Short query for this activity]",
                    "booking_info": {{
                        "required": true/false,
                        "url": "[URL if applicable]",
                        "price_range": "₹XXX-XXX"
                    }},
                    "tag": "[arrival_departure/dining/sightseeing/shopping/entertainment/relaxation/adventure/cultural]",
                    "alternatives": []
                }}
            ]
        }}

        Important Guidelines:
        1. All costs must be in Indian Rupees (₹)
        2. Provide realistic booking URLs for major attractions
        3. Generate a short, specific image search query (1-2 words)
        4. Provide both a brief description (1-2 sentences) and a detailed_description (3-4 paragraphs)
        5. Assign an appropriate tag based on the activity type
        6. Make each alternative distinctly different from the original and from each other
        7. The alternatives array within each activity should be empty []
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            response_data = self._parse_response(response.text)
            
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


# Global AI service instance
ai_service = AIService()

