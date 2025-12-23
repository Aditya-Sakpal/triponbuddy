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
    ActivityRemoveRequest,
    ActivityAlternativesRequest,
    ActivityAlternativesResponse,
    EmergencyNumberSetup,
    EmergencyNumberResponse,
    AccommodationDetailsRequest,
    AccommodationDetailsResponse
)
from services.trip_service import trip_service
from services.ai_service import ai_service
from services.google_maps_service import google_maps_service

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


@router.get("/public", response_model=TripListResponse)
async def get_public_trips(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=200, description="Items per page")
):
    """Get all public trips with available slots for hosting"""

    try:
        logger.info(f"Getting public trips, page: {page}, limit: {limit}")
        result = await trip_service.get_public_trips(
            page=page,
            limit=limit
        )
        logger.info(f"Service returned: {type(result)} with keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        
        response = TripListResponse(**result)
        logger.info(f"Response model created successfully: {type(response)}")
        return response

    except Exception as e:
        logger.error(f"Error getting public trips: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve public trips"
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


@router.get("/{trip_id}/can-edit", response_model=dict)
async def can_edit_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Check if user can edit a trip (must be owner or joined member)"""

    try:
        can_edit = await trip_service.can_user_edit_trip(trip_id, user_id)

        return {
            "success": True,
            "can_edit": can_edit
        }

    except Exception as e:
        logger.error(f"Error checking edit permission: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check edit permission"
        )


@router.get("/{trip_id}/road-route")
async def get_road_route(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get detailed road route with waypoints for a trip"""

    try:
        # Get trip to verify access and get origin/destination
        trip_result = await trip_service.get_trip(trip_id, user_id)
        
        if not trip_result.get("success"):
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip = trip_result.get("trip")
        
        # Check if trip has transportation_mode set to "road"
        if trip.transportation_mode != "road":
            raise HTTPException(
                status_code=400, 
                detail="Road route is only available for trips with road transportation mode"
            )
        
        # Get origin and destination
        origin = trip.start_location
        destination = trip.destination
        
        if not origin or not destination:
            raise HTTPException(
                status_code=400,
                detail="Trip must have both start location and destination"
            )
        
        # Get road route with waypoints
        route_data = await google_maps_service.get_road_route_with_waypoints(
            origin, destination
        )
        
        if not route_data:
            raise HTTPException(
                status_code=500,
                detail="Failed to compute road route"
            )
        
        return {
            "success": True,
            "route": route_data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting road route: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get road route"
        )


@router.get("/{trip_id}/summary")
async def get_trip_summary(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Generate an AI summary for the trip (under 200 words)"""

    try:
        # Get trip to verify access
        trip_result = await trip_service.get_trip(trip_id, user_id)
        
        if not trip_result.get("success"):
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip = trip_result.get("trip")
        
        # Generate summary using AI
        summary = await ai_service.generate_trip_summary(
            trip_title=trip.title,
            destination=trip.destination,
            duration_days=trip.duration_days,
            itinerary_data=trip.itinerary_data
        )
        
        return {
            "success": True,
            "summary": summary
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating trip summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate trip summary"
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


@router.put("/{trip_id}/share", response_model=dict)
async def share_trip(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Make trip public for sharing"""

    try:
        success = await trip_service.make_trip_public(trip_id, user_id)

        if not success:
            raise HTTPException(status_code=404, detail="Trip not found")

        return {
            "success": True,
            "message": "Trip is now public"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to share trip"
        )


@router.post("/{trip_id}/activities/replace", response_model=dict)
async def replace_activity(
    request: Request,
    trip_id: str,
    replace_request: ActivityReplaceRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Replace an activity in a trip with pre-generated activity data (no AI call)"""

    try:
        result = await trip_service.replace_activity(
            trip_id=trip_id,
            user_id=user_id,
            day=replace_request.day,
            activity_index=replace_request.activity_index,
            new_activity_data=replace_request.new_activity_data
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


@router.post("/{trip_id}/activities/alternatives", response_model=ActivityAlternativesResponse)
async def get_activity_alternatives(
    request: Request,
    trip_id: str,
    alternatives_request: ActivityAlternativesRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Generate alternative activities for a specific activity in a trip"""

    try:
        result = await trip_service.generate_activity_alternatives(
            trip_id=trip_id,
            user_id=user_id,
            day=alternatives_request.day,
            activity_index=alternatives_request.activity_index
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to generate alternatives")
            )

        return ActivityAlternativesResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating activity alternatives: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate activity alternatives"
        )


@router.post("/emergency-number", response_model=EmergencyNumberResponse)
async def set_emergency_number(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    emergency_setup: EmergencyNumberSetup = None
):
    """Set emergency contact number for a joined trip"""
    try:
        if not emergency_setup:
            raise HTTPException(status_code=400, detail="Emergency number setup data required")

        result = await trip_service.set_emergency_number(
            trip_id=emergency_setup.trip_id,
            user_id=user_id,
            emergency_number=emergency_setup.emergency_contact_number
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to set emergency number")
            )

        return EmergencyNumberResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting emergency number: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to set emergency number"
        )


@router.post("/{trip_id}/accommodations/details", response_model=AccommodationDetailsResponse)
async def get_accommodation_details(
    request: Request,
    trip_id: str,
    accommodation_request: AccommodationDetailsRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get AI-generated accommodation details for a specific location"""
    try:
        # Verify user is the trip owner - check can_user_edit_trip
        can_edit = await trip_service.can_user_edit_trip(trip_id, user_id)
        if not can_edit:
            raise HTTPException(status_code=403, detail="Only trip owner can add custom accommodations")

        # Generate accommodation details using AI
        result = await ai_service.generate_accommodation_details(
            location=accommodation_request.location,
            destination=accommodation_request.destination
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Failed to generate accommodation details"
            )

        return {
            "success": True,
            "accommodation": result["accommodation"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting accommodation details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get accommodation details: {str(e)}"
        )


@router.post("/{trip_id}/accommodations/add", response_model=dict)
async def add_custom_accommodation(
    request: Request,
    trip_id: str,
    accommodation: dict,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Add a custom accommodation to the trip"""
    try:
        result = await trip_service.add_custom_accommodation(
            trip_id=trip_id,
            user_id=user_id,
            accommodation=accommodation
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to add custom accommodation")
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding custom accommodation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to add custom accommodation"
        )


@router.post("/leave", response_model=dict)
async def leave_trip(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    trip_id: str = Query(..., description="Trip ID to leave")
):
    """Leave a joined trip and remove all instances across the platform"""
    try:
        result = await trip_service.leave_trip(
            trip_id=trip_id,
            user_id=user_id
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Failed to leave trip")
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving trip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to leave trip"
        )

