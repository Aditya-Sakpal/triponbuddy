"""
Database utility functions for document conversion
"""

from typing import Dict, Any, List
from models.trip import TripDB


def convert_mongo_doc_to_trip(doc: Dict[str, Any]) -> TripDB:

    # Create a copy to avoid mutating the original document
    doc_copy = doc.copy()
    
    # Convert MongoDB _id to id field
    doc_id = None
    if "_id" in doc_copy:
        doc_id = str(doc_copy["_id"])
    
    # Ensure all required fields have proper defaults
    trip_data = {
        "id": doc_id,
        "trip_id": doc_copy.get("trip_id"),
        "user_id": doc_copy.get("user_id"),
        "title": doc_copy.get("title"),
        "destinations": doc_copy.get("destinations", []),
        "destination": doc_copy.get("destination"),
        "start_location": doc_copy.get("start_location"),
        "start_date": doc_copy.get("start_date"),
        "end_date": doc_copy.get("end_date"),
        "duration_days": doc_copy.get("duration_days"),
        "budget": doc_copy.get("budget"),
        "travelers": doc_copy.get("travelers"),
        "is_international": doc_copy.get("is_international", False),
        "is_saved": doc_copy.get("is_saved", False),
        "is_public": doc_copy.get("is_public", False),
        "destination_image": doc_copy.get("destination_image"),
        "itinerary_data": doc_copy.get("itinerary_data", {}),
        "tags": doc_copy.get("tags", []),
        "max_passengers": doc_copy.get("max_passengers"),
        "joined_users": doc_copy.get("joined_users", []),
        "preferred_gender": doc_copy.get("preferred_gender"),
        "age_range_min": doc_copy.get("age_range_min"),
        "age_range_max": doc_copy.get("age_range_max"),
        "created_at": doc_copy.get("created_at"),
        "updated_at": doc_copy.get("updated_at"),
    }
    
    return TripDB(**trip_data)


def convert_mongo_docs_to_trips(docs: List[Dict[str, Any]]) -> List[TripDB]:

    trips = []
    for doc in docs:
        try:
            trip = convert_mongo_doc_to_trip(doc)
            trips.append(trip)
        except Exception as e:
            # Log warning but continue processing other documents
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error converting trip document to TripDB: {str(e)}")
            continue
    
    return trips


def convert_trip_to_mongo_doc(trip: TripDB) -> Dict[str, Any]:

    doc = trip.model_dump()
    
    # Convert id field to _id for MongoDB
    if "id" in doc and doc["id"]:
        doc["_id"] = doc["id"]
        del doc["id"]
    
    return doc
