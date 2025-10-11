"""
Trips API router
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request

from models.trip import (
    TripGenerationRequest,
    TripGenerationResponse,
    TripUpdateRequest,
    TripListResponse,
    TripResponse,
    ActivityReplaceRequest,
    ActivityRemoveRequest
)
from services.trip_service import trip_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/generate", response_model=TripGenerationResponse)
async def generate_trip(
    request: Request,
    trip_request: TripGenerationRequest
):
    """Generate a new AI-powered trip itinerary"""

    try:
        result = await trip_service.generate_trip(trip_request)
        return TripGenerationResponse(**result)

    except Exception as e:
        logger.error(f"Error generating trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate trip itinerary"
        )


@router.get("", response_model=TripListResponse)
async def get_user_trips(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    is_saved: Optional[bool] = Query(None, description="Filter by saved status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=200, description="Items per page")
):
    """Get user's trips with pagination"""

    try:
        logger.info(f"Getting trips for user: {user_id}, page: {page}, limit: {limit}")
        result = await trip_service.get_user_trips(
            user_id=user_id,
            is_saved=is_saved,
            page=page,
            limit=limit
        )
        logger.info(f"Service returned: {type(result)} with keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        
        response = TripListResponse(**result)
        logger.info(f"Response model created successfully: {type(response)}")
        return response

    except Exception as e:
        logger.error(f"Error getting user trips: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve trips"
        )


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get a specific trip"""

    try:
        result = await trip_service.get_trip(trip_id, user_id)

        if not result["success"]:
            raise HTTPException(status_code=404, detail="Trip not found")

        return TripResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve trip"
        )


@router.put("/{trip_id}", response_model=dict)
async def update_trip(
    request: Request,
    trip_id: str,
    updates: TripUpdateRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Update a trip"""

    try:
        success = await trip_service.update_trip(trip_id, user_id, updates)

        if not success:
            raise HTTPException(status_code=404, detail="Trip not found")

        return {
            "success": True,
            "message": "Trip updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update trip"
        )


@router.delete("/{trip_id}", response_model=dict)
async def delete_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Delete a trip"""

    try:
        success = await trip_service.delete_trip(trip_id, user_id)

        if not success:
            raise HTTPException(status_code=404, detail="Trip not found")

        return {
            "success": True,
            "message": "Trip deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete trip"
        )


@router.put("/{trip_id}/save", response_model=dict)
async def save_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Mark trip as saved"""

    try:
        success = await trip_service.save_trip(trip_id, user_id)

        if not success:
            raise HTTPException(status_code=404, detail="Trip not found")

        return {
            "success": True,
            "message": "Trip saved successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to save trip"
        )


@router.put("/{trip_id}/unsave", response_model=dict)
async def unsave_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Remove trip from saved"""

    try:
        success = await trip_service.unsave_trip(trip_id, user_id)

        if not success:
            raise HTTPException(status_code=404, detail="Trip not found")

        return {
            "success": True,
            "message": "Trip removed from saved"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unsaving trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to unsave trip"
        )


@router.post("/{trip_id}/activities/replace", response_model=dict)
async def replace_activity(
    request: Request,
    trip_id: str,
    replace_request: ActivityReplaceRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Replace an activity in a trip with a new AI-generated one"""

    try:
        result = await trip_service.replace_activity(
            trip_id=trip_id,
            user_id=user_id,
            day=replace_request.day,
            activity_index=replace_request.activity_index,
            new_activity_name=replace_request.new_activity_name
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to replace activity")
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error replacing activity: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to replace activity"
        )


@router.delete("/{trip_id}/activities/remove", response_model=dict)
async def remove_activity(
    request: Request,
    trip_id: str,
    remove_request: ActivityRemoveRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Remove an activity from a trip"""

    try:
        result = await trip_service.remove_activity(
            trip_id=trip_id,
            user_id=user_id,
            day=remove_request.day,
            activity_index=remove_request.activity_index
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to remove activity")
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing activity: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to remove activity"
        )
