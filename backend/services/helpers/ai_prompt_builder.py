"""
AI prompt building helpers for trip generation
"""

from typing import Dict, Any, Union
from models.trip import TripGenerationRequest, TripPreferences


class AIPromptBuilder:
    """Helper class for building AI prompts"""

    @staticmethod
    def build_itinerary_prompt(request: TripGenerationRequest) -> str:
        """Build the AI prompt for itinerary generation"""

        preferences_text = AIPromptBuilder._build_preferences_text(request.preferences)
        budget_text = f" with budget around ₹{request.budget:,.0f}" if request.budget else ""
        
        # Build travelers information
        travelers_text = ""
        if request.travelers and len(request.travelers) > 0:
            travelers_count = len(request.travelers)
            travelers_details = []
            for traveler in request.travelers:
                travelers_details.append(f"{traveler.age}-year-old {traveler.gender}")
            travelers_text = f"\n        - Number of Travelers: {travelers_count} ({', '.join(travelers_details)})"
        
        prompt = f"""
        Generate a comprehensive {request.duration_days}-day travel itinerary for {request.destination} starting from {request.start_date}.

        Trip Details:
        - Destination: {request.destination}
        - Duration: {request.duration_days} days
        - Start Date: {request.start_date}
        - Starting Location: {request.start_location or 'Not specified'}
        - International Trip: {request.is_international}
        - Preferences: {preferences_text}
        - Budget: {budget_text}{travelers_text}

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
                    "name": "[Hotel Name 1]",
                    "type": "Budget",
                    "price_range": "₹500-1500/night",
                    "rating": "3.0-3.5/5",
                    "location": "[Location]",
                    "booking_url": "[URL]",
                    "amenities": ["Amenity 1", "Amenity 2"]
                }},
                {{
                    "name": "[Hotel Name 2]",
                    "type": "Mid-Range",
                    "price_range": "₹1500-3500/night",
                    "rating": "3.5-4.0/5",
                    "location": "[Location]",
                    "booking_url": "[URL]",
                    "amenities": ["Amenity 1", "Amenity 2", "Amenity 3"]
                }},
                {{
                    "name": "[Hotel Name 3]",
                    "type": "Premium",
                    "price_range": "₹3500-7000/night",
                    "rating": "4.0-4.5/5",
                    "location": "[Location]",
                    "booking_url": "[URL]",
                    "amenities": ["Amenity 1", "Amenity 2", "Amenity 3", "Amenity 4"]
                }},
                {{
                    "name": "[Hotel Name 4]",
                    "type": "Luxury",
                    "price_range": "₹7000+/night",
                    "rating": "4.5-5.0/5",
                    "location": "[Location]",
                    "booking_url": "[URL]",
                    "amenities": ["Amenity 1", "Amenity 2", "Amenity 3", "Amenity 4", "Amenity 5"]
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
        8. Consider the number and demographics of travelers when suggesting activities, accommodation, and transportation
        9. If budget is specified, ensure all recommendations fit within the budget constraints
        10. Provide exactly 3 transportation routes: one flight, one train, and one local transport option
        11. Include transportation hubs for both starting location and destination
        12. Provide comprehensive local transportation options for the destination
        13. Include realistic costs and practical details for all transportation options
        14. For each activity, provide both a brief description (1-2 sentences) and a detailed_description (3-4 paragraphs with rich information about history, significance, visitor experience, tips, and interesting facts)
        15. For each activity, assign an appropriate tag based on the activity type:
            - "arrival_departure" for airports, railway stations, check-in/check-out activities
            - "dining" for restaurants, cafes, food courts, breakfast/lunch/dinner activities
            - "sightseeing" for tourist attractions, monuments, viewpoints, landmarks
            - "shopping" for markets, malls, shopping districts, souvenir shops
            - "entertainment" for shows, performances, cinemas, nightlife
            - "relaxation" for spas, beaches, parks, leisure activities
            - "adventure" for trekking, water sports, adventure activities
            - "cultural" for museums, galleries, cultural centers, heritage sites
        16. For each activity, provide 3-5 alternative activities that could replace it in the same time slot, keeping similar duration and theme. These should be simple activity names as strings.
        17. IMPORTANT: Provide AT LEAST 10-15 accommodation options across different price ranges and categories:
            - Budget (₹500-1500/night): 3-4 options
            - Mid-Range (₹1500-3500/night): 3-4 options
            - Premium (₹3500-7000/night): 2-3 options
            - Luxury (₹7000+/night): 2-3 options
            Include a variety of hotels, hostels, guesthouses, resorts, and homestays based on the destination.
        """

        return prompt

    @staticmethod
    def build_single_activity_prompt(
        destination: str,
        activity_name: str,
        time_slot: str,
        duration: str,
        preferences: Dict[str, Any] = None
    ) -> str:
        """Build prompt for generating a single activity"""

        preferences_text = AIPromptBuilder._build_preferences_text(preferences)

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

        return prompt

    @staticmethod
    def build_alternative_activities_prompt(
        destination: str,
        original_activity: Dict[str, Any],
        time_slot: str,
        duration: str,
        preferences: Dict[str, Any] = None,
        num_alternatives: int = 3
    ) -> str:
        """Build prompt for generating alternative activities"""

        preferences_text = AIPromptBuilder._build_preferences_text(preferences)

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

        return prompt

    @staticmethod
    def _build_preferences_text(preferences: Union[TripPreferences, Dict[str, Any], None] = None) -> str:
        """Build preferences text from preferences (either Pydantic model or dictionary)"""
        if not preferences:
            return ""

        prefs = []
        
        # Handle Pydantic model
        if isinstance(preferences, TripPreferences):
            if preferences.adventure:
                prefs.append("adventure activities")
            if preferences.culture:
                prefs.append("cultural experiences")
            if preferences.relaxation:
                prefs.append("relaxation and wellness")
            if preferences.classical:
                prefs.append("classical sightseeing")
            if preferences.shopping:
                prefs.append("shopping experiences")
            if preferences.food:
                prefs.append("food and cuisine")
        # Handle dictionary
        else:
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

        return f" with focus on: {', '.join(prefs)}" if prefs else ""
