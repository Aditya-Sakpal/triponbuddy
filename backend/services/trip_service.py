"""
Trip management service
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from uuid import uuid4

from database import mongodb
from models.trip import TripGenerationRequest, TripUpdateRequest
from services.ai_service import ai_service
from services.image_service import image_service
from utils.db_utils import convert_mongo_docs_to_trips, convert_mongo_doc_to_trip
from utils.validators import validate_trip_title

logger = logging.getLogger(__name__)


class TripService:
    """Service for managing trips"""

    async def generate_trip(self, request: TripGenerationRequest) -> Dict[str, Any]:
        """Generate a new trip using AI"""

        try:
            # Generate itinerary using AI
            ai_response = await ai_service.generate_itinerary(request)

            # Fetch destination image
            destination_image = None
            try:
                image_response = await image_service.fetch_single_location_images(
                    location=f"{request.destination} tourism landmark",
                    max_images=1,
                    min_width=400,
                    min_height=400
                )
                if image_response.get("success") and image_response.get("images"):
                    destination_image = image_response["images"][0]["url"]
                    logger.info(f"Fetched destination image for {request.destination}: {destination_image}")
            except Exception as img_error:
                logger.warning(f"Failed to fetch destination image: {str(img_error)}")
                # Continue without image

            # Create trip record
            trip_data = {
                "trip_id": str(uuid4()),
                "user_id": request.user_id,
                "title": ai_response["itinerary"]["title"],
                "destination": request.destination,
                "start_location": request.start_location,
                "start_date": request.start_date.isoformat() if hasattr(request.start_date, 'isoformat') else str(request.start_date),
                "duration_days": request.duration_days,
                "budget": request.budget,
                "is_international": request.is_international,
                "is_saved": False,
                "destination_image": destination_image,
                "itinerary_data": ai_response["itinerary"],
                "tags": [],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }

            # Save to database
            trip_id = await mongodb.insert_one("trips", trip_data)

            # Update user trip count
            await self._update_user_trip_count(request.user_id)

            return {
                "success": True,
                "trip_id": trip_data["trip_id"],
                "itinerary": ai_response["itinerary"],
                "image_queries": ai_response["image_queries"]
            }

        except Exception as e:
            logger.error(f"Error generating trip: {str(e)}")
            raise

    async def get_user_trips(
        self,
        user_id: str,
        is_saved: Optional[bool] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Get user's trips with pagination"""

        try:
            logger.info(f"Getting trips for user: {user_id}")
            
            # Build filter
            filter_query = {"user_id": user_id}
            if is_saved is not None:
                filter_query["is_saved"] = is_saved
            
            logger.info(f"Filter query: {filter_query}")

            # Calculate skip
            skip = (page - 1) * limit

            # Get trips
            trip_docs = await mongodb.find_many(
                "trips",
                filter_query,
                limit=limit,
                skip=skip,
                sort=[("created_at", -1)]
            )
            
            logger.info(f"Found {len(trip_docs)} trip documents")

            # Convert to TripDB instances using utility function
            trips = convert_mongo_docs_to_trips(trip_docs)
            
            logger.info(f"Converted to {len(trips)} TripDB instances")

            # Get total count
            total = await mongodb.count_documents("trips", filter_query)
            
            result = {
                "success": True,
                "trips": trips,
                "total": total,
                "page": page,
                "limit": limit,
                "has_next": (page * limit) < total,
                "has_prev": page > 1
            }
            
            logger.info(f"Returning result with {len(trips)} trips, total: {total}")
            return result

        except Exception as e:
            logger.error(f"Error getting user trips: {str(e)}")
            raise

    async def get_trip(self, trip_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific trip"""

        try:
            trip_doc = await mongodb.find_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )

            if trip_doc:
                try:
                    # Convert to TripDB instance using utility function
                    trip = convert_mongo_doc_to_trip(trip_doc)
                    
                    return {
                        "success": True,
                        "trip": trip
                    }
                except Exception as e:
                    logger.error(f"Error converting trip document to TripDB: {str(e)}")
                    return {
                        "success": False,
                        "error": "Error processing trip data"
                    }
            else:
                return {
                    "success": False,
                    "error": "Trip not found"
                }

        except Exception as e:
            logger.error(f"Error getting trip: {str(e)}")
            raise

    async def update_trip(
        self,
        trip_id: str,
        user_id: str,
        updates: TripUpdateRequest
    ) -> bool:
        """Update a trip"""

        try:
            # Validate updates
            if updates.title and not validate_trip_title(updates.title):
                raise ValueError("Invalid trip title")

            # Build update document
            update_doc = {}
            if updates.title is not None:
                update_doc["title"] = updates.title
            if updates.is_saved is not None:
                update_doc["is_saved"] = updates.is_saved
            if updates.tags is not None:
                update_doc["tags"] = updates.tags

            if not update_doc:
                return True  # No updates needed

            # Update in database
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {"$set": update_doc}
            )

            if success and updates.is_saved is not None:
                # Update user trip count
                await self._update_user_trip_count(user_id)

            return success

        except Exception as e:
            logger.error(f"Error updating trip: {str(e)}")
            raise

    async def delete_trip(self, trip_id: str, user_id: str) -> bool:
        """Delete a trip"""

        try:
            # Delete from database
            success = await mongodb.delete_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )

            if success:
                # Update user trip count
                await self._update_user_trip_count(user_id)

            return success

        except Exception as e:
            logger.error(f"Error deleting trip: {str(e)}")
            raise

    async def save_trip(self, trip_id: str, user_id: str) -> bool:
        """Mark trip as saved"""

        try:
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {"$set": {"is_saved": True}}
            )

            if success:
                await self._update_user_trip_count(user_id)

            return success

        except Exception as e:
            logger.error(f"Error saving trip: {str(e)}")
            raise

    async def unsave_trip(self, trip_id: str, user_id: str) -> bool:
        """Remove trip from saved"""

        try:
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {"$set": {"is_saved": False}}
            )

            if success:
                await self._update_user_trip_count(user_id)

            return success

        except Exception as e:
            logger.error(f"Error unsaving trip: {str(e)}")
            raise

    async def _update_user_trip_count(self, user_id: str):
        """Update user's trip count"""

        try:
            # Count total trips
            total_trips = await mongodb.count_documents("trips", {"user_id": user_id})

            # Count saved trips
            saved_trips = await mongodb.count_documents(
                "trips",
                {"user_id": user_id, "is_saved": True}
            )

            # Update user profile
            await mongodb.update_one(
                "users",
                {"user_id": user_id},
                {
                    "$set": {
                        "total_trips_created": total_trips,
                        "total_trips_saved": saved_trips,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

        except Exception as e:
            logger.warning(f"Failed to update user trip count: {str(e)}")

    async def replace_activity(
        self,
        trip_id: str,
        user_id: str,
        day: int,
        activity_index: int,
        new_activity_name: str
    ) -> Dict[str, Any]:
        """Replace an activity in a trip with a new one generated by AI"""

        try:
            # Get the trip
            trip_doc = await mongodb.find_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )

            if not trip_doc:
                return {"success": False, "error": "Trip not found"}

            # Get itinerary data
            itinerary_data = trip_doc.get("itinerary_data", {})
            daily_plans = itinerary_data.get("daily_plans", [])

            # Find the day and activity
            target_day = None
            for plan in daily_plans:
                if plan.get("day") == day:
                    target_day = plan
                    break

            if not target_day or not target_day.get("activities"):
                return {"success": False, "error": "Day or activities not found"}

            if activity_index < 0 or activity_index >= len(target_day["activities"]):
                return {"success": False, "error": "Invalid activity index"}

            # Get the original activity details
            original_activity = target_day["activities"][activity_index]
            time_slot = original_activity.get("time", "10:00 AM")
            duration = original_activity.get("duration", "2 hours")

            # Generate new activity using AI
            ai_response = await ai_service.generate_single_activity(
                destination=itinerary_data.get("destination", ""),
                activity_name=new_activity_name,
                time_slot=time_slot,
                duration=duration,
                preferences=None  # Could pass trip preferences if stored
            )

            if not ai_response.get("success"):
                return {"success": False, "error": "Failed to generate new activity"}

            # Replace the activity
            target_day["activities"][activity_index] = ai_response["activity"]

            # Update the trip in database
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {
                    "$set": {
                        "itinerary_data": itinerary_data,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

            if success:
                return {
                    "success": True,
                    "activity": ai_response["activity"],
                    "message": "Activity replaced successfully"
                }
            else:
                return {"success": False, "error": "Failed to update trip"}

        except Exception as e:
            logger.error(f"Error replacing activity: {str(e)}")
            raise

    async def remove_activity(
        self,
        trip_id: str,
        user_id: str,
        day: int,
        activity_index: int
    ) -> Dict[str, Any]:
        """Remove an activity from a trip"""

        try:
            # Get the trip
            trip_doc = await mongodb.find_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )

            if not trip_doc:
                return {"success": False, "error": "Trip not found"}

            # Get itinerary data
            itinerary_data = trip_doc.get("itinerary_data", {})
            daily_plans = itinerary_data.get("daily_plans", [])

            # Find the day and activity
            target_day = None
            for plan in daily_plans:
                if plan.get("day") == day:
                    target_day = plan
                    break

            if not target_day or not target_day.get("activities"):
                return {"success": False, "error": "Day or activities not found"}

            if activity_index < 0 or activity_index >= len(target_day["activities"]):
                return {"success": False, "error": "Invalid activity index"}

            # Remove the activity
            removed_activity = target_day["activities"].pop(activity_index)

            # Update the trip in database
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {
                    "$set": {
                        "itinerary_data": itinerary_data,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

            if success:
                return {
                    "success": True,
                    "removed_activity": removed_activity,
                    "message": "Activity removed successfully"
                }
            else:
                return {"success": False, "error": "Failed to update trip"}

        except Exception as e:
            logger.error(f"Error removing activity: {str(e)}")
            raise

    async def generate_activity_alternatives(
        self,
        trip_id: str,
        user_id: str,
        day: int,
        activity_index: int
    ) -> Dict[str, Any]:
        """Generate alternative activities for a specific activity"""

        try:
            # Get the trip
            trip_doc = await mongodb.find_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )

            if not trip_doc:
                return {"success": False, "error": "Trip not found"}

            # Get itinerary data
            itinerary_data = trip_doc.get("itinerary_data", {})
            daily_plans = itinerary_data.get("daily_plans", [])

            # Find the day and activity
            target_day = None
            for plan in daily_plans:
                if plan.get("day") == day:
                    target_day = plan
                    break

            if not target_day or not target_day.get("activities"):
                return {"success": False, "error": "Day or activities not found"}

            if activity_index < 0 or activity_index >= len(target_day["activities"]):
                return {"success": False, "error": "Invalid activity index"}

            # Get the original activity details
            original_activity = target_day["activities"][activity_index]
            time_slot = original_activity.get("time", "10:00 AM")
            duration = original_activity.get("duration", "2 hours")
            destination = itinerary_data.get("destination", "")

            # Generate alternative activities using AI
            ai_response = await ai_service.generate_alternative_activities(
                destination=destination,
                original_activity=original_activity,
                time_slot=time_slot,
                duration=duration,
                preferences=None  # Could pass trip preferences if stored
            )

            if not ai_response.get("success"):
                return {"success": False, "error": "Failed to generate alternatives"}

            return {
                "success": True,
                "alternatives": ai_response["alternatives"],
                "original_activity": original_activity,
                "message": "Alternatives generated successfully"
            }

        except Exception as e:
            logger.error(f"Error generating activity alternatives: {str(e)}")
            raise


# Global trip service instance
trip_service = TripService()

