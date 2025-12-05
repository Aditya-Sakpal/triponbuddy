"""
AI response parsing and validation helpers
"""

import json
import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class AIResponseParser:
    """Helper class for parsing and validating AI responses"""

    @staticmethod
    def parse_json_response(response_text: str) -> Dict[str, Any]:
        """Parse the AI response and extract JSON"""
        try:
            # Check if response_text is None or empty
            if not response_text:
                raise ValueError("Response text is None or empty")
            
            # Clean the response text
            cleaned_text = response_text.strip()

            # Remove markdown code blocks if present
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]

            cleaned_text = cleaned_text.strip()

            # Remove trailing commas before closing brackets/braces (common AI error)
            # Remove trailing comma before closing brace
            cleaned_text = re.sub(r',(\s*})', r'\1', cleaned_text)
            # Remove trailing comma before closing bracket
            cleaned_text = re.sub(r',(\s*\])', r'\1', cleaned_text)

            # Parse JSON
            return json.loads(cleaned_text)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Response text (first 500 chars): {response_text[:500]}")
            logger.error(f"Response text (last 500 chars): {response_text[-500:]}")
            raise Exception("Invalid response format from AI service")


class AIItineraryValidator:
    """Helper class for validating and cleaning itinerary data"""

    @staticmethod
    def validate_itinerary(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean the itinerary data"""
        # Ensure required fields exist
        required_fields = [
            "title", "destination", "duration_days", "start_date",
            "estimated_total_cost", "best_time_to_visit", "travel_tips",
            "daily_plans", "accommodation", "transportation"
        ]

        for field in required_fields:
            if field not in data:
                data[field] = AIItineraryValidator._get_default_value(field)

        # Validate transportation structure
        data = AIItineraryValidator._validate_transportation(data)

        # Validate daily plans and convert any date objects to strings
        data = AIItineraryValidator._validate_daily_plans(data)

        # Initialize optional fields if missing
        data = AIItineraryValidator._initialize_optional_fields(data)

        # Convert start_date to string if it's a date object
        if "start_date" in data and hasattr(data["start_date"], 'isoformat'):
            data["start_date"] = data["start_date"].isoformat()

        return data

    @staticmethod
    def _validate_transportation(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate transportation structure"""
        if "transportation" not in data or not isinstance(data["transportation"], dict):
            data["transportation"] = {"routes": []}
        elif "routes" not in data["transportation"]:
            data["transportation"]["routes"] = []

        # Ensure we have the 3 required route types
        route_types = ["flight", "train", "local"]
        existing_routes = [route.get("type", "").lower() for route in data["transportation"]["routes"]]
        for route_type in route_types:
            if route_type not in existing_routes:
                data["transportation"]["routes"].append(AIItineraryValidator._get_default_route(route_type))

        return data

    @staticmethod
    def _validate_daily_plans(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate daily plans and convert any date objects to strings"""
        if "daily_plans" in data and isinstance(data["daily_plans"], list):
            for plan in data["daily_plans"]:
                if "activities" not in plan:
                    plan["activities"] = []
                # Convert date fields to strings if they exist
                if "date" in plan and hasattr(plan["date"], 'isoformat'):
                    plan["date"] = plan["date"].isoformat()

        return data

    @staticmethod
    def _initialize_optional_fields(data: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize optional fields if missing"""
        optional_fields = ["transportation_hubs_start", "transportation_hubs_destination", "local_transportation"]
        for field in optional_fields:
            if field not in data:
                data[field] = []

        return data

    @staticmethod
    def _get_default_value(field: str) -> Any:
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

    @staticmethod
    def _get_default_route(route_type: str) -> Dict[str, Any]:
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


class AIItineraryProcessor:
    """Helper class for processing itinerary data"""

    @staticmethod
    def set_generic_themes(itinerary: Dict[str, Any]) -> None:
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


