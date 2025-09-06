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
    TripResponse
)
from services.trip_service import trip_service
from utils.rate_limit import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/generate", response_model=TripGenerationResponse)
@limiter.limit("10/minute")
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
@limiter.limit("30/minute")
async def get_user_trips(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    is_saved: Optional[bool] = Query(None, description="Filter by saved status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Items per page")
):
    """Get user's trips with pagination"""

    try:
        result = await trip_service.get_user_trips(
            user_id=user_id,
            is_saved=is_saved,
            page=page,
            limit=limit
        )
        return TripListResponse(**result)

    except Exception as e:
        logger.error(f"Error getting user trips: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve trips"
        )


@router.get("/{trip_id}", response_model=TripResponse)
@limiter.limit("30/minute")
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
@limiter.limit("20/minute")
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
@limiter.limit("10/minute")
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
@limiter.limit("20/minute")
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
@limiter.limit("20/minute")
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
