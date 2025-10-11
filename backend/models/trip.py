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
    detailed_description: str = Field(description="Detailed description with more context and information")
    estimated_cost: str = Field(description="Cost in INR")
    duration: str = Field(description="Duration of activity")
    image_search_query: str = Field(description="Query for image search")
    booking_info: Optional[Dict[str, Any]] = Field(default=None, description="Booking information")
    tag: str = Field(default="sightseeing", description="Activity tag: arrival_departure, dining, sightseeing, shopping, entertainment, relaxation, adventure, cultural")
    alternatives: List[str] = Field(default_factory=list, description="List of alternative activity names for this time slot")


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


class TravelRoute(BaseModel):
    """Travel route model with multiple transport options"""
    type: str = Field(description="Type of transport: flight, train, or local")
    from_location: str = Field(alias="from", description="Departure location")
    to: str = Field(description="Arrival location")
    estimated_cost: str = Field(description="Cost in INR")
    duration: str = Field(description="Duration")
    booking_url: str = Field(description="Booking URL")
    details: Optional[str] = Field(default=None, description="Additional details about the route")


class Transportation(BaseModel):
    """Transportation model with multiple routes"""
    routes: List[TravelRoute] = Field(description="Available travel routes (flight, train, local)")


class TransportationHub(BaseModel):
    """Transportation hub model"""
    name: str = Field(description="Hub name (airport, railway station, etc.)")
    type: str = Field(description="Type of hub: airport, railway_station, bus_station")
    location: str = Field(description="Location of the hub")
    distance_from_city: str = Field(description="Distance from city center")
    estimated_cost_to_reach: str = Field(description="Cost to reach hub from city")
    transportation_options: List[str] = Field(description="Available transport options to/from hub")


class LocalTransportation(BaseModel):
    """Local transportation options at destination"""
    type: str = Field(description="Type of local transport: taxi, rickshaw, metro, bus, etc.")
    description: str = Field(description="Description of the transport option")
    estimated_cost: str = Field(description="Cost in INR")
    availability: str = Field(description="When it's available")
    coverage_area: str = Field(description="Areas it covers")
    booking_info: Optional[str] = Field(default=None, description="How to book or use")


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
    transportation: Transportation = Field(description="Transportation options with routes")
    transportation_hubs_start: List[TransportationHub] = Field(default_factory=list, description="Transportation hubs at starting location")
    transportation_hubs_destination: List[TransportationHub] = Field(default_factory=list, description="Transportation hubs at destination")
    local_transportation: List[LocalTransportation] = Field(default_factory=list, description="Local transportation options at destination")
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
    destination_image: Optional[str] = Field(default=None, description="Destination image URL")
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


class ActivityReplaceRequest(BaseModel):
    """Request model for replacing an activity"""
    day: int = Field(ge=1, description="Day number")
    activity_index: int = Field(ge=0, description="Index of activity in the day's activities list")
    new_activity_name: str = Field(description="Name of the new activity to generate")


class ActivityRemoveRequest(BaseModel):
    """Request model for removing an activity"""
    day: int = Field(ge=1, description="Day number")
    activity_index: int = Field(ge=0, description="Index of activity in the day's activities list")


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
