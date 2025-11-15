"""
Users API router
"""

import logging
from fastapi import APIRouter, HTTPException, Query, Request, Body

from models.user import (
    UserStatsResponse,
    UserProfileUpdate,
    UserProfileResponse,
    UserProfile
)
from database import mongodb

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/stats", response_model=UserStatsResponse)
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

        stats = {
            "total_trips": total_trips,
            "saved_trips": saved_trips,
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


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get user profile information"""
    try:
        # Check if user profile exists
        user_doc = await mongodb.find_one("users", {"user_id": user_id})
        
        if user_doc:
            profile = UserProfile(
                user_id=user_doc["user_id"],
                age=user_doc.get("age"),
                gender=user_doc.get("gender")
            )
        else:
            # Return empty profile if user doesn't exist yet
            profile = UserProfile(
                user_id=user_id,
                age=None,
                gender=None
            )
        
        return UserProfileResponse(
            success=True,
            profile=profile
        )
    
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve user profile"
        )


@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    profile_data: UserProfileUpdate = Body(...)
):
    """Update user profile with age and gender"""
    try:
        # Validate age and gender
        if profile_data.age < 18:
            raise HTTPException(
                status_code=400,
                detail="You must be at least 18 years old"
            )
        
        if profile_data.gender not in ["male", "female", "other"]:
            raise HTTPException(
                status_code=400,
                detail="Gender must be one of: male, female, other"
            )
        
        # Check if user profile exists
        existing_user = await mongodb.find_one("users", {"user_id": user_id})
        
        user_data = {
            "user_id": user_id,
            "age": profile_data.age,
            "gender": profile_data.gender
        }
        
        if existing_user:
            # Update existing profile
            await mongodb.update_one(
                "users",
                {"user_id": user_id},
                {"$set": user_data}
            )
        else:
            # Create new profile
            await mongodb.insert_one("users", user_data)
        
        profile = UserProfile(
            user_id=user_id,
            age=profile_data.age,
            gender=profile_data.gender
        )
        
        return UserProfileResponse(
            success=True,
            message="Profile updated successfully",
            profile=profile
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update user profile"
        )
