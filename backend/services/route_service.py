"""
Route generation service for creating transportation route plans
"""

import logging
from typing import Dict, Any
from google import genai
from config import settings

logger = logging.getLogger(__name__)


class RouteService:
    """Service for generating transportation route plans using AI"""

    def __init__(self):
        self.client = genai.Client(api_key=settings.google_gemini_api_key)

    async def generate_route_plan(
        self,
        from_location: str,
        to_locations: list,
        destination_city: str
    ) -> Dict[str, Any]:
        """
        Generate a route plan from starting location through multiple destinations
        
        Args:
            from_location: Starting point (e.g., "Hotel Taj, Powai, Mumbai")
            to_locations: Ordered list of destinations (e.g., ["Gateway of India", "Marine Drive", "Juhu Beach"])
            destination_city: City name for context
            
        Returns:
            Dict containing the route plan with segments, modes, landmarks
        """
        
        prompt = self._build_route_prompt(from_location, to_locations, destination_city)
        
        try:
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt
            )
            
            route_data = self._parse_route_response(response.text)
            
            return {
                "success": True,
                "route_plan": route_data
            }
            
        except Exception as e:
            logger.error(f"Error generating route plan: {str(e)}")
            raise Exception(f"Failed to generate route plan: {str(e)}")

    def _build_route_prompt(
        self,
        from_location: str,
        to_locations: list,
        destination_city: str
    ) -> str:
        """Build the AI prompt for route generation"""
        
        # Build the destinations string
        if len(to_locations) == 1:
            destinations_text = f'"{to_locations[0]}"'
            route_description = f"from {from_location} to {to_locations[0]}"
        else:
            destinations_list = " -> ".join([f'"{loc}"' for loc in to_locations])
            route_description = f"from {from_location} through: {destinations_list}"
        
        final_destination = to_locations[-1]
        
        prompt = f"""
        Generate a detailed transportation route plan {route_description} in {destination_city}.
        
        The route should cover multiple stops in sequence:
        - Start: {from_location}
        {chr(10).join([f'- Stop {i+1}: {loc}' for i, loc in enumerate(to_locations)])}
        
        The route should provide a step-by-step guide with multiple transport modes, landmarks, and street names 
        so the traveler doesn't feel lost. Include practical details like metro line colors, bus numbers, 
        auto rickshaw stands, major intersections, and recognizable landmarks along the way.
        
        Create a CONTINUOUS route that goes through ALL the locations in order. Each segment should connect 
        the previous location to the next one.
        
        Provide the response in the following JSON format:
        {{
            "from_location": "{from_location}",
            "to_location": "{final_destination}",
            "total_distance": "X km",
            "total_time": "X minutes/hours",
            "total_cost": "₹XXX-XXX",
            "segments": [
                {{
                    "step_number": 1,
                    "mode": "walk/auto/taxi/metro/bus/etc",
                    "from_location": "[Starting point]",
                    "to_location": "[Next point in the journey]",
                    "description": "[Brief description of what to do]",
                    "landmarks": ["Landmark 1 to pass by", "Landmark 2 to pass by"],
                    "estimated_time": "X minutes",
                    "estimated_cost": "₹XX",
                    "details": "[Additional details like: Take Yellow Line metro towards XYZ, get down at ABC station. Or: Take bus number 123 from XYZ stop. Or: Walk along ABC Street passing by XYZ Market.]"
                }},
                {{
                    "step_number": 2,
                    "mode": "metro",
                    "from_location": "[Previous stop]",
                    "to_location": "[Next destination]",
                    "description": "[What to do in this step]",
                    "landmarks": ["Landmark visible from metro/bus", "Notable station"],
                    "estimated_time": "X minutes",
                    "estimated_cost": "₹XX",
                    "details": "[Metro line color/name, direction, number of stops, exit to take]"
                }}
            ],
            "tips": [
                "Tip 1 about the route or area",
                "Tip 2 about best time to travel",
                "Tip 3 about what to carry or watch out for"
            ]
        }}
        
        IMPORTANT GUIDELINES:
        1. Create a continuous route that visits ALL {len(to_locations)} destination(s) in the exact order specified
        2. Break each leg of the journey into clear, manageable segments with different transport modes
        3. Include walking segments where necessary (to/from stations, stands)
        4. Mention specific landmarks, street names, and recognizable points
        5. For metro: include line color/name, direction, station names, exit numbers
        6. For buses: include bus numbers, route names, major stops
        7. For auto/taxi: include pickup points, major roads to take, traffic circles or junctions
        8. Include realistic time and cost estimates based on {destination_city} standards
        9. Add 3-5 practical tips about the complete route
        10. Make it detailed enough that someone unfamiliar with the area can follow easily
        11. Ensure the segments flow logically from one location to the next
        12. Return ONLY valid JSON without any markdown formatting or code blocks
        """
        
        return prompt

    def _parse_route_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and extract route data"""
        
        import json
        import re
        
        try:
            # Remove markdown code block formatting if present
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```'):
                # Remove ```json or ``` at the start
                cleaned_text = re.sub(r'^```(?:json)?\s*\n', '', cleaned_text)
                # Remove ``` at the end
                cleaned_text = re.sub(r'\n```\s*$', '', cleaned_text)
            
            # Parse JSON
            route_data = json.loads(cleaned_text)
            
            # Validate required fields
            required_fields = ["from_location", "to_location", "total_distance", 
                             "total_time", "total_cost", "segments"]
            for field in required_fields:
                if field not in route_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure segments is a list and not empty
            if not isinstance(route_data["segments"], list) or len(route_data["segments"]) == 0:
                raise ValueError("Segments must be a non-empty list")
            
            # Ensure tips exist
            if "tips" not in route_data:
                route_data["tips"] = []
            
            return route_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse route response as JSON: {str(e)}")
            logger.error(f"Response text: {response_text}")
            raise Exception("Invalid JSON response from AI")
        except Exception as e:
            logger.error(f"Error parsing route response: {str(e)}")
            raise


# Global route service instance
route_service = RouteService()
