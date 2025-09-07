"""
Users API router
"""

import logging
from fastapi import APIRouter, HTTPException, Query, Request

from models.user import (
    UserProfile,
    UserProfileUpdate,
    UserProfileResponse,
    UserStatsResponse
)
from database import mongodb
from utils.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=UserProfileResponse)
@limiter.limit("30/minute")
async def get_user_profile(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get user profile"""

    try:
        profile = await mongodb.find_one("users", {"user_id": user_id})

        if not profile:
            # Create default profile if not exists
            default_profile = UserProfile(
                user_id=user_id,
                email="",  # Will be updated when available
                display_name=None,
            )
            profile_id = await mongodb.insert_one("users", default_profile.dict())
            profile = await mongodb.find_one("users", {"_id": profile_id})

        return UserProfileResponse(success=True, profile=UserProfile(**profile))

    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve user profile"
        )


@router.put("/profile", response_model=UserProfileResponse)
@limiter.limit("10/minute")
async def update_user_profile(
    request: Request,
    updates: UserProfileUpdate,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Update user profile"""

    try:
        # Build update document
        update_doc = {}
        if updates.display_name is not None:
            update_doc["display_name"] = updates.display_name
        if updates.preferences is not None:
            update_doc["preferences"] = updates.preferences.model_dump()
        if updates.favorite_destinations is not None:
            update_doc["favorite_destinations"] = updates.favorite_destinations

        if not update_doc:
            # Get current profile
            profile = await mongodb.find_one("users", {"user_id": user_id})
            if not profile:
                raise HTTPException(status_code=404, detail="User profile not found")
            return UserProfileResponse(success=True, profile=UserProfile(**profile))

        # Update profile
        success = await mongodb.update_one(
            "users",
            {"user_id": user_id},
            {"$set": update_doc}
        )

        if not success:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Get updated profile
        updated_profile = await mongodb.find_one("users", {"user_id": user_id})
        return UserProfileResponse(success=True, profile=UserProfile(**updated_profile))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update user profile"
        )


@router.get("/stats", response_model=UserStatsResponse)
@limiter.limit("30/minute")
async def get_user_stats(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get user statistics"""

    try:
        # Get user profile
        profile = await mongodb.find_one("users", {"user_id": user_id})

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Get trip statistics
        total_trips = profile.get("total_trips_created", 0)
        saved_trips = profile.get("total_trips_saved", 0)
        favorite_destinations = profile.get("favorite_destinations", [])

        # Get recent destinations from trips
        recent_trips = await mongodb.find_many(
            "trips",
            {"user_id": user_id},
            limit=10,
            sort=[("created_at", -1)]
        )

        recent_destinations = list(set(trip.get("destination", "") for trip in recent_trips if trip.get("destination")))

        stats = {
            "total_trips": total_trips,
            "saved_trips": saved_trips,
            "favorite_destinations": favorite_destinations,
            "recent_destinations": recent_destinations[:5]  # Limit to 5
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
