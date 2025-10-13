"""
Trip data helpers for building and managing trip records
"""

import logging
from typing import Dict, Any
from datetime import datetime, timezone
from uuid import uuid4

logger = logging.getLogger(__name__)


class TripDataBuilder:
    """Helper class for building trip data structures"""

    @staticmethod
    def build_trip_data(
        user_id: str,
        ai_response: Dict[str, Any],
        request_data: Dict[str, Any],
        destination_image: str = None
    ) -> Dict[str, Any]:
        """Build trip data from AI response and request data"""
        
        itinerary = ai_response["itinerary"]
        
        trip_data = {
            "trip_id": str(uuid4()),
            "user_id": user_id,
            "title": itinerary["title"],
            "destination": request_data.get("destination"),
            "start_location": request_data.get("start_location"),
            "start_date": TripDataBuilder._format_date(request_data.get("start_date")),
            "duration_days": request_data.get("duration_days"),
            "budget": request_data.get("budget"),
            "is_international": request_data.get("is_international"),
            "is_saved": False,
            "destination_image": destination_image,
            "itinerary_data": itinerary,
            "tags": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        return trip_data

    @staticmethod
    def build_update_document(updates: Any) -> Dict[str, Any]:
        """Build MongoDB update document from TripUpdateRequest"""
        update_doc = {}
        
        if updates.title is not None:
            update_doc["title"] = updates.title
        if updates.is_saved is not None:
            update_doc["is_saved"] = updates.is_saved
        if updates.tags is not None:
            update_doc["tags"] = updates.tags
            
        return update_doc

    @staticmethod
    def _format_date(date_value: Any) -> str:
        """Format date value to ISO string"""
        if hasattr(date_value, 'isoformat'):
            return date_value.isoformat()
        return str(date_value)


class TripItineraryHelper:
    """Helper class for working with trip itinerary data"""

    @staticmethod
    def find_day_in_itinerary(daily_plans: list, day: int) -> Dict[str, Any]:
        """Find a specific day in daily plans"""
        for plan in daily_plans:
            if plan.get("day") == day:
                return plan
        return None

    @staticmethod
    def validate_activity_index(activities: list, activity_index: int) -> bool:
        """Validate if activity index is within bounds"""
        return 0 <= activity_index < len(activities)

    @staticmethod
    def get_activity_details(activity: Dict[str, Any]) -> Dict[str, str]:
        """Extract key details from an activity"""
        return {
            "time": activity.get("time", "10:00 AM"),
            "duration": activity.get("duration", "2 hours")
        }


class TripQueryBuilder:
    """Helper class for building MongoDB queries"""

    @staticmethod
    def build_user_trips_filter(user_id: str, is_saved: bool = None) -> Dict[str, Any]:
        """Build filter query for user trips"""
        filter_query = {"user_id": user_id}
        if is_saved is not None:
            filter_query["is_saved"] = is_saved
        return filter_query

    @staticmethod
    def build_trip_filter(trip_id: str, user_id: str) -> Dict[str, Any]:
        """Build filter query for a specific trip"""
        return {"trip_id": trip_id, "user_id": user_id}

    @staticmethod
    def calculate_pagination(page: int, limit: int) -> Dict[str, int]:
        """Calculate skip value for pagination"""
        return {
            "skip": (page - 1) * limit,
            "limit": limit
        }


class TripResponseBuilder:
    """Helper class for building API response structures"""

    @staticmethod
    def build_trips_response(
        trips: list,
        total: int,
        page: int,
        limit: int
    ) -> Dict[str, Any]:
        """Build paginated trips response"""
        return {
            "success": True,
            "trips": trips,
            "total": total,
            "page": page,
            "limit": limit,
            "has_next": (page * limit) < total,
            "has_prev": page > 1
        }

    @staticmethod
    def build_success_response(data: Dict[str, Any], message: str = None) -> Dict[str, Any]:
        """Build generic success response"""
        response = {"success": True, **data}
        if message:
            response["message"] = message
        return response

    @staticmethod
    def build_error_response(error: str) -> Dict[str, Any]:
        """Build generic error response"""
        return {
            "success": False,
            "error": error
        }
