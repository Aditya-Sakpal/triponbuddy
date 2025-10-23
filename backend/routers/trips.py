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
    RouteGenerationRequest,
    RouteGenerationResponse
)
from services.trip_service import trip_service
from services.route_service import route_service

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


@router.get("/{trip_id}/route/destinations", response_model=dict)
async def get_route_destinations(
    request: Request,
    trip_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get all available destinations from itinerary (excluding arrival/departure activities)"""

    try:
        trip_result = await trip_service.get_trip(trip_id, user_id)
        
        if not trip_result.get("success"):
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip = trip_result.get("trip")
        itinerary_data = trip.itinerary_data
        
        # Extract unique locations from all activities, excluding arrival/departure
        destinations = []
        arrival_hotel = None
        
        if "daily_plans" in itinerary_data:
            for day_plan in itinerary_data["daily_plans"]:
                for activity in day_plan.get("activities", []):
                    tag = activity.get("tag", "")
                    location = activity.get("location", "")
                    activity_name = activity.get("activity", "")
                    
                    # Store the first hotel as arrival hotel
                    if arrival_hotel is None and day_plan.get("day") == 1:
                        # Look for accommodation/hotel in first day activities
                        if "hotel" in activity_name.lower() or "check" in activity_name.lower():
                            arrival_hotel = location
                    
                    # Skip arrival/departure activities
                    if tag != "arrival_departure" and location:
                        # Create unique destination entry
                        dest_entry = {
                            "location": location,
                            "activity": activity_name,
                            "day": day_plan.get("day"),
                            "time": activity.get("time", "")
                        }
                        
                        # Check if this location is already in the list
                        if not any(d["location"] == location for d in destinations):
                            destinations.append(dest_entry)
        
        # If no arrival hotel found, use first accommodation from the accommodation list
        if not arrival_hotel and "accommodation" in itinerary_data:
            accommodations = itinerary_data.get("accommodation", [])
            if accommodations and len(accommodations) > 0:
                arrival_hotel = accommodations[0].get("location", "") or accommodations[0].get("name", "")
        
        return {
            "success": True,
            "arrival_hotel": arrival_hotel or "Starting Point",
            "destinations": destinations,
            "destination_city": itinerary_data.get("destination", "")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting route destinations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve destinations"
        )


@router.post("/{trip_id}/route/generate", response_model=RouteGenerationResponse)
async def generate_route(
    request: Request,
    trip_id: str,
    route_request: RouteGenerationRequest,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Generate a transportation route plan from arrival hotel to a selected destination"""

    try:
        # Validate that the trip belongs to the user
        trip_result = await trip_service.get_trip(trip_id, user_id)
        
        if not trip_result.get("success"):
            raise HTTPException(status_code=404, detail="Trip not found")
        
        # Validate the request matches the trip
        if route_request.trip_id != trip_id or route_request.user_id != user_id:
            raise HTTPException(status_code=400, detail="Invalid request parameters")
        
        # Validate that at least one destination is provided
        if not route_request.to_locations or len(route_request.to_locations) == 0:
            raise HTTPException(status_code=400, detail="At least one destination is required")
        
        # Generate the route plan
        result = await route_service.generate_route_plan(
            from_location=route_request.from_location,
            to_locations=route_request.to_locations,
            destination_city=route_request.destination_city
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Failed to generate route plan"
            )

        return RouteGenerationResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating route: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate route plan"
        )

