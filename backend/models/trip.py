"""
Trip-related Pydantic models
"""

from typing import List, Optional, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field
from uuid import uuid4


class Activity(BaseModel):
    """Activity model for daily plans"""
    time: str = Field(description="Time in HH:MM AM/PM format")
    activity: str = Field(description="Activity name")
    location: str = Field(description="Location of activity")
    description: str = Field(description="Brief description")
    estimated_cost: str = Field(description="Cost in INR")
    duration: str = Field(description="Duration of activity")
    image_search_query: str = Field(description="Query for image search")
    booking_info: Optional[Dict[str, Any]] = Field(default=None, description="Booking information")


class DailyPlan(BaseModel):
    """Daily plan model"""
    day: int = Field(description="Day number", ge=1)
    date: str = Field(description="Date as ISO string")
    theme: str = Field(description="Theme for the day")
    activities: List[Activity] = Field(description="List of activities")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class Accommodation(BaseModel):
    """Accommodation model"""
    name: str = Field(description="Hotel/Restaurant name")
    type: str = Field(description="Type of accommodation")
    price_range: str = Field(description="Price range")
    rating: str = Field(description="Rating")
    location: str = Field(description="Location")
    booking_url: str = Field(description="Booking URL")
    amenities: List[str] = Field(description="List of amenities")


class Transportation(BaseModel):
    """Transportation model"""
    type: str = Field(description="Type of transportation")
    from_location: str = Field(alias="from", description="Departure location")
    to: str = Field(description="Arrival location")
    estimated_cost: str = Field(description="Cost in INR")
    duration: str = Field(description="Duration")
    booking_url: str = Field(description="Booking URL")


class NeighboringPlace(BaseModel):
    """Neighboring place model"""
    name: str = Field(description="Place name")
    distance: str = Field(description="Distance from main destination")
    description: str = Field(description="Description")
    time_to_reach: str = Field(description="Time to reach")
    best_known_for: str = Field(description="What it's known for")
    estimated_cost: str = Field(description="Cost in INR")
    image_search_query: str = Field(description="Query for image search")


class Itinerary(BaseModel):
    """Complete itinerary model"""
    title: str = Field(description="Trip title")
    destination: str = Field(description="Main destination")
    duration_days: int = Field(ge=1, le=30, description="Duration in days")
    start_date: str = Field(description="Start date as ISO string")
    estimated_total_cost: str = Field(description="Total cost in INR")
    best_time_to_visit: str = Field(description="Best time to visit")
    travel_tips: List[str] = Field(description="Travel tips")
    daily_plans: List[DailyPlan] = Field(description="Daily plans")
    accommodation: List[Accommodation] = Field(description="Accommodation options")
    transportation: List[Transportation] = Field(description="Transportation options")
    neighboring_places: List[NeighboringPlace] = Field(default_factory=list, description="Nearby places")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class TripPreferences(BaseModel):
    """User preferences for trip generation"""
    adventure: Optional[bool] = False
    culture: Optional[bool] = False
    relaxation: Optional[bool] = False
    classical: Optional[bool] = False
    shopping: Optional[bool] = False
    food: Optional[bool] = False


class TripGenerationRequest(BaseModel):
    """Request model for trip generation"""
    user_id: str = Field(description="User ID from Clerk")
    destination: str = Field(description="Destination city/country")
    start_location: Optional[str] = Field(default=None, description="Starting location")
    start_date: date = Field(description="Trip start date")
    duration_days: int = Field(ge=1, le=30, description="Trip duration")
    budget: Optional[float] = Field(default=None, ge=0, description="Budget in INR")
    preferences: Optional[TripPreferences] = Field(default=None, description="User preferences")
    is_international: bool = Field(default=False, description="International trip flag")


class TripGenerationResponse(BaseModel):
    """Response model for trip generation"""
    success: bool = Field(default=True, description="Success status")
    trip_id: str = Field(description="Unique trip identifier")
    itinerary: "Itinerary" = Field(description="Generated itinerary")
    image_queries: List[str] = Field(description="Image search queries")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class TripDB(BaseModel):
    """Trip database model"""
    id: Optional[str] = Field(default=None, description="MongoDB ObjectId")
    trip_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique trip ID")
    user_id: str = Field(description="User ID from Clerk")
    title: str = Field(description="Trip title")
    destination: str = Field(description="Destination")
    start_location: Optional[str] = Field(default=None, description="Starting location")
    start_date: str = Field(description="Start date as ISO string")
    end_date: Optional[str] = Field(default=None, description="End date as ISO string")
    duration_days: int = Field(description="Duration in days")
    budget: Optional[float] = Field(default=None, description="Budget in INR")
    is_international: bool = Field(default=False, description="International flag")
    is_saved: bool = Field(default=False, description="Saved status")
    itinerary_data: Dict[str, Any] = Field(description="Full itinerary data")
    tags: List[str] = Field(default_factory=list, description="Trip tags")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Update timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class TripUpdateRequest(BaseModel):
    """Request model for updating trip"""
    title: Optional[str] = None
    is_saved: Optional[bool] = None
    tags: Optional[List[str]] = None


class TripListResponse(BaseModel):
    """Response model for trip listing"""
    success: bool = Field(default=True)
    trips: List[TripDB] = Field(description="List of trips")
    total: int = Field(description="Total number of trips")
    page: int = Field(default=1, description="Current page")
    limit: int = Field(default=20, description="Items per page")
    has_next: bool = Field(default=False, description="Has next page")
    has_prev: bool = Field(default=False, description="Has previous page")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class TripResponse(BaseModel):
    """Response model for single trip"""
    success: bool = Field(default=True)
    trip: TripDB = Field(description="Trip data")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }
