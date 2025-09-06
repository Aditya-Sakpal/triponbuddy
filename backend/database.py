"""
MongoDB connection and database operations for TripOnBuddy
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
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
            self.client = AsyncMongoClient(settings.mongodb_url)
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
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def _create_indexes(self) -> None:
        """Create database indexes for better query performance."""
        try:
            # Trips collection indexes
            await self.database.trips.create_index("trip_id", unique=True)
            await self.database.trips.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.trips.create_index([("user_id", 1), ("is_saved", 1)])

            # Users collection indexes
            await self.database.users.create_index("user_id", unique=True)
            await self.database.users.create_index("email", unique=True)

            # Feedback collection indexes
            await self.database.feedback.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.feedback.create_index("feedback_type")

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
        sort: Optional[List[tuple]] = None
    ) -> List[Dict[str, Any]]:
        """Find many documents in a collection."""
        collection = self.get_collection(collection_name)
        cursor = collection.find(filter)

        if sort:
            cursor = cursor.sort(sort)
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
        document["created_at"] = datetime.now(timezone.utc)
        document["updated_at"] = datetime.now(timezone.utc)

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
        update["$set"]["updated_at"] = datetime.now(timezone.utc)

        collection = self.get_collection(collection_name)
        result = await collection.update_one(filter, update)
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
