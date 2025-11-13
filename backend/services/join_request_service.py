"""
Join Request Service for trip sharing functionality
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timezone
from uuid import uuid4

from database import mongodb
from models.trip import (
    JoinRequest,
    JoinRequestCreate,
    Notification
)

logger = logging.getLogger(__name__)


class JoinRequestService:
    """Service for managing trip join requests and notifications"""

    async def create_join_request(
        self,
        trip_id: str,
        requester_id: str,
        requester_name: str,
        request_data: JoinRequestCreate
    ) -> Dict[str, Any]:
        """Create a new join request for a trip"""
        try:
            # Get trip details
            trip_doc = await mongodb.find_one("trips", {"trip_id": trip_id})
            if not trip_doc:
                return {"success": False, "message": "Trip not found"}

            # Check if trip owner
            if trip_doc["user_id"] == requester_id:
                return {"success": False, "message": "Cannot join your own trip"}

            # Check if max_passengers is set
            if not trip_doc.get("max_passengers"):
                return {"success": False, "message": "This trip is not available for joining"}

            # Calculate current passenger count (owner + travelers + joined users)
            current_travelers = len(trip_doc.get("travelers", []))
            joined_users = len(trip_doc.get("joined_users", []))
            current_passengers = 1 + current_travelers + joined_users  # +1 for owner

            # Check if trip has available slots
            if current_passengers >= trip_doc["max_passengers"]:
                return {"success": False, "message": "This trip is already full"}

            # Check if user already joined
            if requester_id in trip_doc.get("joined_users", []):
                return {"success": False, "message": "You have already joined this trip"}

            # Check if there's already a pending request
            existing_request = await mongodb.find_one(
                "join_requests",
                {
                    "trip_id": trip_id,
                    "requester_id": requester_id,
                    "status": "pending"
                }
            )
            if existing_request:
                return {"success": False, "message": "You already have a pending request for this trip"}

            # Validate age requirement (must be 18+)
            if request_data.age < 18:
                return {
                    "success": False, 
                    "message": "Sorry, you must be at least 18 years old to join trips."
                }

            # Check gender preference
            preferred_gender = trip_doc.get("preferred_gender")
            if preferred_gender and preferred_gender != request_data.gender:
                return {
                    "success": False, 
                    "message": "We apologize, but the trip owner is looking for travel companions with similar preferences."
                }

            # Check age range
            age_min = trip_doc.get("age_range_min")
            age_max = trip_doc.get("age_range_max")
            
            if age_min is not None and request_data.age < age_min:
                return {
                    "success": False, 
                    "message": f"We apologize, but the trip owner is looking for travelers aged {age_min} and above."
                }
            
            if age_max is not None and request_data.age > age_max:
                return {
                    "success": False, 
                    "message": f"We apologize, but the trip owner is looking for travelers aged {age_max} and below."
                }

            # Create join request
            join_request = JoinRequest(
                trip_id=trip_id,
                trip_owner_id=trip_doc["user_id"],
                requester_id=requester_id,
                requester_name=requester_name,
                requester_age=request_data.age,
                requester_gender=request_data.gender,
                trip_title=trip_doc["title"],
                trip_destination=trip_doc["destination"]
            )

            # Save to database
            await mongodb.insert_one("join_requests", join_request.model_dump())

            # Create notification for trip owner
            notification = Notification(
                user_id=trip_doc["user_id"],
                type="join_request",
                title="New Join Request",
                message=f"{requester_name} wants to join your trip to {trip_doc['destination']}",
                related_trip_id=trip_id,
                related_request_id=join_request.request_id,
                requester_id=requester_id,
                requester_name=requester_name,
                created_at=datetime.now(timezone.utc)
            )
            await mongodb.insert_one("notifications", notification.model_dump())

            logger.info(f"Join request created: {join_request.request_id}")
            return {
                "success": True,
                "message": "Join request sent successfully",
                "request": join_request
            }

        except Exception as e:
            logger.error(f"Error creating join request: {str(e)}")
            raise

    async def handle_join_request(
        self,
        request_id: str,
        action: str,
        trip_owner_id: str
    ) -> Dict[str, Any]:
        """Accept or reject a join request"""
        try:
            # Get join request
            request_doc = await mongodb.find_one("join_requests", {"request_id": request_id})
            if not request_doc:
                return {"success": False, "message": "Join request not found"}

            # Verify the user is the trip owner
            if request_doc["trip_owner_id"] != trip_owner_id:
                return {"success": False, "message": "Unauthorized"}

            # Check if already processed
            if request_doc["status"] != "pending":
                return {"success": False, "message": "Request already processed"}

            # Update request status
            await mongodb.update_one(
                "join_requests",
                {"request_id": request_id},
                {"$set": {"status": action, "updated_at": datetime.now(timezone.utc)}}
            )

            if action == "accepted":
                # Get trip details
                trip_doc = await mongodb.find_one("trips", {"trip_id": request_doc["trip_id"]})
                if not trip_doc:
                    return {"success": False, "message": "Trip not found"}

                # Add user to joined_users list with demographics
                joined_users = trip_doc.get("joined_users", [])
                joined_users_demographics = trip_doc.get("joined_users_demographics", [])
                
                if request_doc["requester_id"] not in joined_users:
                    joined_users.append(request_doc["requester_id"])
                    
                    # Add demographics for this joined user
                    joined_users_demographics.append({
                        "user_id": request_doc["requester_id"],
                        "age": request_doc["requester_age"],
                        "gender": request_doc["requester_gender"]
                    })
                    
                    await mongodb.update_one(
                        "trips",
                        {"trip_id": request_doc["trip_id"]},
                        {
                            "$set": {
                                "joined_users": joined_users,
                                "joined_users_demographics": joined_users_demographics
                            }
                        }
                    )

                # Create a copy of the trip for the joined user
                await self._create_joined_trip_copy(trip_doc, request_doc)

                # Create notification for requester
                notification = Notification(
                    user_id=request_doc["requester_id"],
                    type="join_accepted",
                    title="Join Request Accepted",
                    message=f"Your request to join the trip to {request_doc['trip_destination']} has been accepted!",
                    related_trip_id=request_doc["trip_id"],
                    related_request_id=request_id,
                    created_at=datetime.now(timezone.utc)
                )
                await mongodb.insert_one("notifications", notification.model_dump())

                logger.info(f"Join request accepted: {request_id}")
                return {"success": True, "message": "Join request accepted"}

            else:  # rejected
                logger.info(f"Join request rejected: {request_id}")
                return {"success": True, "message": "Join request rejected"}

        except Exception as e:
            logger.error(f"Error handling join request: {str(e)}")
            raise

    async def _create_joined_trip_copy(self, original_trip: Dict[str, Any], request_doc: Dict[str, Any]) -> None:
        """Create a copy of the trip for the joined user"""
        try:
            
            # Create a new trip document for the joined user
            joined_trip = {
                "trip_id": str(uuid4()),
                "user_id": request_doc["requester_id"],
                "title": f"{original_trip['title']} (Joined)",
                "destinations": original_trip.get("destinations", [original_trip["destination"]]),
                "destination": original_trip["destination"],
                "start_location": original_trip.get("start_location"),
                "start_date": original_trip["start_date"],
                "end_date": original_trip.get("end_date"),
                "duration_days": original_trip["duration_days"],
                "budget": original_trip.get("budget"),
                "travelers": [],  # The joined user can add their own travelers later
                "is_international": original_trip.get("is_international", False),
                "is_saved": False,  # Not saved - will appear in joined trips tab
                "is_joined": True,  # Flag to identify this as a joined trip copy
                "is_public": False,
                "destination_image": original_trip.get("destination_image"),
                "itinerary_data": original_trip["itinerary_data"],
                "tags": original_trip.get("tags", []),
                "max_passengers": None,  # Joined trip cannot be shared further
                "joined_users": [],
                "joined_users_demographics": [],
                "original_trip_id": original_trip["trip_id"],  # Reference to original trip
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }

            await mongodb.insert_one("trips", joined_trip)
            logger.info(f"Created joined trip copy for user {request_doc['requester_id']} with is_joined=True, is_saved=False, original_trip_id={original_trip['trip_id']}")

        except Exception as e:
            logger.error(f"Error creating joined trip copy: {str(e)}")
            raise

    async def get_user_notifications(self, user_id: str) -> Dict[str, Any]:
        """Get all notifications for a user"""
        try:
            # Get notifications sorted by creation date
            notifications = await mongodb.find_many(
                "notifications",
                {"user_id": user_id},
                sort=[("created_at", -1)],
                limit=50
            )

            # Count unread notifications
            unread_count = await mongodb.count_documents(
                "notifications",
                {"user_id": user_id, "is_read": False}
            )

            # Enrich notifications with request status for join_request type
            enriched_notifications = []
            for notif in notifications:
                notification_dict = notif if isinstance(notif, dict) else notif
                
                # If it's a join request notification, fetch the request status
                if notification_dict.get("type") == "join_request" and notification_dict.get("related_request_id"):
                    request = await mongodb.find_one(
                        "join_requests",
                        {"request_id": notification_dict["related_request_id"]}
                    )
                    if request:
                        notification_dict["request_status"] = request.get("status", "pending")
                    else:
                        notification_dict["request_status"] = "unknown"
                
                enriched_notifications.append(notification_dict)

            # Convert to Notification models
            notification_list = [Notification(**notif) for notif in enriched_notifications]

            return {
                "success": True,
                "notifications": notification_list,
                "unread_count": unread_count
            }

        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            raise

    async def mark_notification_read(self, notification_id: str, user_id: str) -> Dict[str, Any]:
        """Mark a notification as read"""
        try:
            result = await mongodb.update_one(
                "notifications",
                {"notification_id": notification_id, "user_id": user_id},
                {"$set": {"is_read": True}}
            )

            if result:
                return {"success": True, "message": "Notification marked as read"}
            else:
                return {"success": False, "message": "Notification not found"}

        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            raise

    async def get_pending_requests_for_user_trips(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all pending join requests for trips owned by the user"""
        try:
            requests = await mongodb.find_many(
                "join_requests",
                {"trip_owner_id": user_id, "status": "pending"},
                sort=[("created_at", -1)]
            )

            return [JoinRequest(**req).model_dump() for req in requests]

        except Exception as e:
            logger.error(f"Error getting pending requests: {str(e)}")
            raise


# Global instance
join_request_service = JoinRequestService()
