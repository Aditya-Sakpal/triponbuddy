import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from database import mongodb
from models.trip import TripGenerationRequest, TripUpdateRequest
from services.ai_service import ai_service
from services.image_service import image_service
from utils.db_utils import convert_mongo_docs_to_trips, convert_mongo_doc_to_trip
from services.helpers.trip_data_helper import (
    TripDataBuilder,
    TripItineraryHelper,
    TripQueryBuilder,
    TripResponseBuilder
)

logger = logging.getLogger(__name__)


def validate_trip_title(title: str) -> bool:
    if not title or len(title.strip()) == 0:
        return False
    return len(title) <= 200


class TripService:

    def __init__(self):
        self.data_builder = TripDataBuilder()
        self.itinerary_helper = TripItineraryHelper()
        self.query_builder = TripQueryBuilder()
        self.response_builder = TripResponseBuilder()

    async def generate_trip(self, request: TripGenerationRequest) -> Dict[str, Any]:

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

            # Build trip data using helper
            trip_data = self.data_builder.build_trip_data(
                user_id=request.user_id,
                ai_response=ai_response,
                request_data=request.dict(),
                destination_image=destination_image
            )

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

        try:
            logger.info(f"Getting trips for user: {user_id}")
            
            # Build filter using helper
            filter_query = self.query_builder.build_user_trips_filter(user_id, is_saved)
            logger.info(f"Filter query: {filter_query}")

            # Calculate pagination using helper
            pagination = self.query_builder.calculate_pagination(page, limit)

            # Get trips
            trip_docs = await mongodb.find_many(
                "trips",
                filter_query,
                limit=pagination["limit"],
                skip=pagination["skip"],
                sort=[("created_at", -1)]
            )
            
            logger.info(f"Found {len(trip_docs)} trip documents")

            # Convert to TripDB instances using utility function
            trips = convert_mongo_docs_to_trips(trip_docs)
            
            logger.info(f"Converted to {len(trips)} TripDB instances")

            # Get total count
            total = await mongodb.count_documents("trips", filter_query)
            
            # Build response using helper
            result = self.response_builder.build_trips_response(trips, total, page, limit)
            
            logger.info(f"Returning result with {len(trips)} trips, total: {total}")
            return result

        except Exception as e:
            logger.error(f"Error getting user trips: {str(e)}")
            raise

    async def get_trip(self, trip_id: str, user_id: str) -> Optional[Dict[str, Any]]:

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

        try:
            # Validate updates
            if updates.title and not validate_trip_title(updates.title):
                raise ValueError("Invalid trip title")

            # Build update document using helper
            update_doc = self.data_builder.build_update_document(updates)

            if not update_doc:
                return True  # No updates needed

            # Update in database
            success = await mongodb.update_one(
                "trips",
                self.query_builder.build_trip_filter(trip_id, user_id),
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
        new_activity_data: Dict[str, Any]
    ) -> Dict[str, Any]:

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

            # Find the day and activity using helper
            target_day = self.itinerary_helper.find_day_in_itinerary(daily_plans, day)

            if not target_day or not target_day.get("activities"):
                return {"success": False, "error": "Day or activities not found"}

            # Validate activity index using helper
            if not self.itinerary_helper.validate_activity_index(target_day["activities"], activity_index):
                return {"success": False, "error": "Invalid activity index"}

            # Simply replace the activity with the provided data (no AI call)
            target_day["activities"][activity_index] = new_activity_data
            logger.info(f"Replaced activity at day {day}, index {activity_index} with pre-generated data")

            # Update the trip in database
            success = await mongodb.update_one(
                "trips",
                self.query_builder.build_trip_filter(trip_id, user_id),
                {
                    "$set": {
                        "itinerary_data": itinerary_data,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

            if success:
                return self.response_builder.build_success_response(
                    {"activity": new_activity_data},
                    "Activity replaced successfully"
                )
            else:
                return self.response_builder.build_error_response("Failed to update trip")

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

