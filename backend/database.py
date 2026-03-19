"""
MongoDB connection and database operations for TripOnBuddy
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import certifi
from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import ConnectionFailure

from config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB client wrapper with async operations."""

    def __init__(self):
        self.client: Optional[AsyncMongoClient] = None
        self.database: Optional[AsyncDatabase] = None

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            # Use certifi CA bundle to avoid SSL certificate issues on some local Python installs (macOS).
            # If your MongoDB URL already configures TLS options, this is still safe.
            self.client = AsyncMongoClient(
                settings.mongodb_url,
                tlsCAFile=certifi.where(),
            )
            self.database = self.client[settings.mongodb_db_name]

            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.mongodb_db_name}")

            # Create indexes for better performance
            await self._create_indexes()

        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error connecting to MongoDB: {e}")
            raise

    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from MongoDB")

    async def _create_indexes(self) -> None:
        """Create database indexes for better query performance."""
        try:
            # Trips collection indexes
            await self.database.trips.create_index("trip_id", unique=True)
            await self.database.trips.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.trips.create_index([("user_id", 1), ("is_saved", 1)])
            await self.database.trips.create_index([("is_public", 1), ("created_at", -1)])

            # Feedback collection indexes
            await self.database.feedback.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.feedback.create_index("feedback_type")

            # Subscription collection indexes for paywall
            await self.database.subscriptions.create_index("order_id", unique=True)
            await self.database.subscriptions.create_index([("user_id", 1), ("status", 1)])
            await self.database.subscriptions.create_index([("user_id", 1), ("created_at", -1)])

            # Forum posts collection indexes
            await self.database.posts.create_index("post_id", unique=True)
            await self.database.posts.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.posts.create_index([("created_at", -1)])

            # Forum comments collection indexes
            await self.database.comments.create_index("comment_id", unique=True)
            await self.database.comments.create_index([("post_id", 1), ("created_at", 1)])
            await self.database.comments.create_index([("parent_comment_id", 1)])
            await self.database.comments.create_index([("user_id", 1), ("created_at", -1)])

            # Forum likes collection indexes
            await self.database.likes.create_index([("user_id", 1), ("target_id", 1), ("target_type", 1)], unique=True)
            await self.database.likes.create_index([("target_id", 1), ("target_type", 1)])

            # Join requests collection indexes
            await self.database.join_requests.create_index("request_id", unique=True)
            await self.database.join_requests.create_index([("trip_id", 1), ("status", 1)])
            await self.database.join_requests.create_index([("requester_id", 1), ("status", 1)])
            await self.database.join_requests.create_index([("trip_owner_id", 1), ("status", 1)])

            # Notifications collection indexes
            await self.database.notifications.create_index("notification_id", unique=True)
            await self.database.notifications.create_index([("user_id", 1), ("is_read", 1), ("created_at", -1)])
            await self.database.notifications.create_index([("user_id", 1), ("created_at", -1)])

            logger.info("Database indexes created successfully")

        except Exception as e:
            logger.warning(f"Failed to create indexes: {e}")

    def get_collection(self, collection_name: str) -> AsyncCollection:
        """Get a collection from the database."""
        if self.database is None:
            raise RuntimeError("Database not connected")
        return self.database[collection_name]

    # Generic database operations
    async def find_one(self, collection_name: str, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find one document in a collection."""
        collection = self.get_collection(collection_name)
        doc = await collection.find_one(filter)
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def find_many(
        self,
        collection_name: str,
        filter: Dict[str, Any],
        limit: Optional[int] = None,
        skip: Optional[int] = None,
        sort: Optional[List[tuple]] = None
    ) -> List[Dict[str, Any]]:
        """Find many documents in a collection."""
        collection = self.get_collection(collection_name)
        cursor = collection.find(filter)

        if sort:
            cursor = cursor.sort(sort)
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)

        results = []
        async for doc in cursor:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            results.append(doc)

        return results

    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Insert one document into a collection."""
        # Only set timestamps if they don't already exist
        if "created_at" not in document:
            document["created_at"] = datetime.now(timezone.utc)
        if "updated_at" not in document:
            document["updated_at"] = datetime.now(timezone.utc)

        # Log what's being inserted for debugging
        if collection_name == "trips":
            logger.info(f"Inserting trip into {collection_name}: trip_id={document.get('trip_id')}, "
                       f"max_passengers={document.get('max_passengers')}, "
                       f"travelers={document.get('travelers')}, "
                       f"end_date={document.get('end_date')}, "
                       f"is_public={document.get('is_public')}")
        else:
            logger.debug(f"Inserting document into {collection_name}")

        collection = self.get_collection(collection_name)
        result = await collection.insert_one(document)
        return str(result.inserted_id)

    async def update_one(
        self,
        collection_name: str,
        filter: Dict[str, Any],
        update: Dict[str, Any]
    ) -> bool:
        """Update one document in a collection."""
        # Create a copy to avoid modifying the original
        update_copy = update.copy()
        
        # Add updated_at timestamp to $set operator
        if "$set" not in update_copy:
            update_copy["$set"] = {}
        update_copy["$set"]["updated_at"] = datetime.now(timezone.utc)

        # Log trip updates
        if collection_name == "trips":
            logger.info(f"Updating {collection_name} with filter={filter}, update={update_copy}")

        collection = self.get_collection(collection_name)
        result = await collection.update_one(filter, update_copy)
        
        logger.info(f"Update {collection_name} with filter {filter}: matched={result.matched_count}, modified={result.modified_count}, update={update_copy}")
        
        return result.modified_count > 0

    async def delete_one(self, collection_name: str, filter: Dict[str, Any]) -> bool:
        """Delete one document from a collection."""
        collection = self.get_collection(collection_name)
        result = await collection.delete_one(filter)
        return result.deleted_count > 0

    async def delete_many(self, collection_name: str, filter: Dict[str, Any]) -> int:
        """Delete many documents from a collection."""
        collection = self.get_collection(collection_name)
        result = await collection.delete_many(filter)
        return result.deleted_count

    async def count_documents(self, collection_name: str, filter: Dict[str, Any]) -> int:
        """Count documents in a collection."""
        collection = self.get_collection(collection_name)
        return await collection.count_documents(filter)


# Global MongoDB instance
mongodb = MongoDB()
