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
            # Use model_dump() for Pydantic v2 with mode='python' to include None values
            request_data = request.model_dump(mode='python', exclude_none=False)
            logger.info(f"Request data received: max_passengers={request_data.get('max_passengers')}, "
                       f"travelers={request_data.get('travelers')}, "
                       f"full request_data keys: {list(request_data.keys())}")
            
            trip_data = self.data_builder.build_trip_data(
                user_id=request.user_id,
                ai_response=ai_response,
                request_data=request_data,
                destination_image=destination_image
            )
            
            logger.info(f"Creating trip with max_passengers={trip_data.get('max_passengers')}, "
                       f"travelers={trip_data.get('travelers')}, "
                       f"end_date={trip_data.get('end_date')}, "
                       f"start_date={trip_data.get('start_date')}, "
                       f"duration_days={trip_data.get('duration_days')}")
            
            logger.info(f"FINAL trip_data before MongoDB insert: max_passengers={trip_data.get('max_passengers')}, "
                       f"travelers={trip_data.get('travelers')}, "
                       f"travelers type={type(trip_data.get('travelers'))}")

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
            logger.info(f"Getting trip {trip_id} for user {user_id}")
            
            # First try to find trip owned by user
            trip_doc = await mongodb.find_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id}
            )
            
            if trip_doc:
                logger.info(f"Found trip owned by user")
            
            # If not found and not owned by user, check if it's a public trip
            if not trip_doc:
                logger.info(f"Trip not owned by user, checking if public")
                trip_doc = await mongodb.find_one(
                    "trips",
                    {"trip_id": trip_id, "is_public": True}
                )
                if trip_doc:
                    logger.info(f"Found public trip")
            
            # If still not found, check if user has joined this trip
            if not trip_doc:
                logger.info(f"Not a public trip, checking if user joined")
                trip_doc = await mongodb.find_one(
                    "trips",
                    {"trip_id": trip_id, "joined_users": user_id}
                )
                if trip_doc:
                    logger.info(f"Found trip where user is joined")

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
                logger.warning(f"Trip {trip_id} not found for user {user_id} (not owned, not public, not joined)")
                # Check if trip exists at all
                any_trip = await mongodb.find_one("trips", {"trip_id": trip_id})
                if any_trip:
                    logger.info(f"Trip exists but is_public={any_trip.get('is_public', False)}")
                else:
                    logger.warning(f"Trip {trip_id} does not exist in database")
                
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
            logger.info(f"Updating trip {trip_id} with updates: {updates.model_dump()}")
            
            # Validate updates
            if updates.title and not validate_trip_title(updates.title):
                raise ValueError("Invalid trip title")

            # Build update document using helper
            update_doc = self.data_builder.build_update_document(updates)
            logger.info(f"Built update document: {update_doc}")

            if not update_doc:
                return True  # No updates needed

            # Add updated_at timestamp
            update_doc["updated_at"] = datetime.now(timezone.utc)

            # Update in database
            success = await mongodb.update_one(
                "trips",
                self.query_builder.build_trip_filter(trip_id, user_id),
                {"$set": update_doc}
            )
            logger.info(f"Update result: {success}")

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

    async def make_trip_public(self, trip_id: str, user_id: str) -> bool:
        """Make a trip public for sharing"""

        try:
            success = await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {"$set": {"is_public": True}}
            )

            logger.info(f"Trip {trip_id} set to public: {success}")
            return success

        except Exception as e:
            logger.error(f"Error making trip public: {str(e)}")
            raise

    async def can_user_edit_trip(self, trip_id: str, user_id: str) -> bool:
        """Check if user can edit a trip (must be owner or joined member)"""

        try:
            trip_doc = await mongodb.find_one("trips", {"trip_id": trip_id})
            
            if not trip_doc:
                return False
            
            # Check if user is the owner
            if trip_doc["user_id"] == user_id:
                return True
            
            # Check if user is a joined member
            joined_users = trip_doc.get("joined_users", [])
            if user_id in joined_users:
                return True
            
            return False

        except Exception as e:
            logger.error(f"Error checking edit permission: {str(e)}")
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

    async def get_public_trips(
        self,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Get all public trips with available slots for hosting"""
        
        try:
            logger.info(f"Getting public trips with available slots, page: {page}, limit: {limit}")
            
            # Build filter for public trips with max_passengers set
            filter_query = {
                "is_public": True,
                "max_passengers": {"$exists": True, "$gt": 0}
            }
            
            logger.info(f"Filter query: {filter_query}")

            # Calculate pagination
            pagination = self.query_builder.calculate_pagination(page, limit)

            # Get trips
            trip_docs = await mongodb.find_many(
                "trips",
                filter_query,
                limit=pagination["limit"],
                skip=pagination["skip"],
                sort=[("created_at", -1)]
            )
            
            logger.info(f"Found {len(trip_docs)} public trip documents")

            # Convert to TripDB instances
            trips = convert_mongo_docs_to_trips(trip_docs)
            
            logger.info(f"Converted to {len(trips)} TripDB instances")

            # Get total count
            total = await mongodb.count_documents("trips", filter_query)
            
            # Build response
            result = self.response_builder.build_trips_response(trips, total, page, limit)
            
            logger.info(f"Returning result with {len(trips)} public trips, total: {total}")
            return result

        except Exception as e:
            logger.error(f"Error getting public trips: {str(e)}")
            raise

    async def set_emergency_number(
        self,
        trip_id: str,
        user_id: str,
        emergency_number: str
    ) -> Dict[str, Any]:
        """Set emergency contact number for a joined trip"""
        try:
            # Verify the trip exists and user has joined it
            trip_doc = await mongodb.find_one(
                "trips",
                {
                    "trip_id": trip_id,
                    "user_id": user_id,
                    "is_joined": True
                }
            )

            if not trip_doc:
                return {
                    "success": False,
                    "message": "Trip not found or you haven't joined this trip"
                }

            # Update the emergency contact number
            await mongodb.update_one(
                "trips",
                {"trip_id": trip_id, "user_id": user_id},
                {"$set": {"emergency_contact_number": emergency_number, "updated_at": datetime.now(timezone.utc)}}
            )

            logger.info(f"Emergency number set for trip {trip_id} by user {user_id}")
            return {
                "success": True,
                "message": "Emergency contact number saved successfully"
            }

        except Exception as e:
            logger.error(f"Error setting emergency number: {str(e)}")
            raise

    async def leave_trip(self, trip_id: str, user_id: str) -> Dict[str, Any]:
        """Leave a joined trip and remove all instances across the platform"""
        try:
            # Find the joined trip copy for this user
            joined_trip = await mongodb.find_one(
                "trips",
                {
                    "user_id": user_id,
                    "is_joined": True,
                    "original_trip_id": trip_id
                }
            )

            if not joined_trip:
                # Try with trip_id directly (in case it's the joined copy's ID)
                joined_trip = await mongodb.find_one(
                    "trips",
                    {
                        "trip_id": trip_id,
                        "user_id": user_id,
                        "is_joined": True
                    }
                )

                if not joined_trip:
                    return {
                        "success": False,
                        "message": "Joined trip not found"
                    }

            # Get the original trip ID
            original_trip_id = joined_trip.get("original_trip_id") or trip_id

            # Delete the joined trip copy
            await mongodb.delete_one(
                "trips",
                {
                    "trip_id": joined_trip["trip_id"],
                    "user_id": user_id
                }
            )

            # Remove user from the original trip's joined_users array
            await mongodb.update_one(
                "trips",
                {"trip_id": original_trip_id},
                {
                    "$pull": {
                        "joined_users": user_id,
                        "joined_users_demographics": {"user_id": user_id}
                    },
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )

            logger.info(f"User {user_id} left trip {original_trip_id}")
            return {
                "success": True,
                "message": "Successfully left the trip"
            }

        except Exception as e:
            logger.error(f"Error leaving trip: {str(e)}")
            raise


# Global trip service instance
trip_service = TripService()

