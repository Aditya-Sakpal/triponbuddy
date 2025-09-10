"""
Users API router
"""

import logging
from fastapi import APIRouter, HTTPException, Query, Request

from models.user import (
    UserStatsResponse
)
from database import mongodb
from utils.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/stats", response_model=UserStatsResponse)
@limiter.limit("30/minute")
async def get_user_stats(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get user statistics"""

    try:
        # Get all trips for the user
        all_trips = await mongodb.find_many(
            "trips",
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )

        # Calculate statistics from trips
        total_trips = len(all_trips)
        saved_trips = len([trip for trip in all_trips if trip.get("is_saved", False)])

        # Get recent destinations (unique destinations from recent trips)
        recent_destinations = []
        seen_destinations = set()
        
        for trip in all_trips:
            destination = trip.get("destination", "")
            if destination and destination not in seen_destinations:
                recent_destinations.append(destination)
                seen_destinations.add(destination)
                if len(recent_destinations) >= 5:  # Limit to 5
                    break

        # For now, we'll use recent destinations as favorite destinations
        # since we don't have a user profile to store actual favorites
        favorite_destinations = recent_destinations[:3]  # Top 3 as favorites

        stats = {
            "total_trips": total_trips,
            "saved_trips": saved_trips,
            "favorite_destinations": favorite_destinations,
            "recent_destinations": recent_destinations
        }

        return UserStatsResponse(success=True, stats=stats)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve user statistics"
        )
