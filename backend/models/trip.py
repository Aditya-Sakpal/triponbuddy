"""
Trip-related Pydantic models
"""

from typing import List, Optional, Dict, Any
from datetime import date, datetime, timezone
from pydantic import BaseModel, Field, model_validator, ConfigDict
from enum import Enum
from uuid import uuid4


class TransportationMode(str, Enum):
    """Transportation mode options"""
    DEFAULT = "default"
    ROAD = "road"
    TRAIN = "train"
    FLIGHT = "flight"


class Traveler(BaseModel):
    """Traveler model with age and gender"""
    age: int = Field(ge=1, le=120, description="Age of traveler")
    gender: str = Field(description="Gender of traveler (male, female, other)")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


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
    destinations: List[str] = Field(min_length=1, description="Ordered list of destinations")
    destination: str = Field(description="Final destination (last item in destinations)")
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
    neighboring_places: List[NeighboringPlace] = Field(default_factory=list, min_length=5, description="Nearby places (minimum 5)")

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
    destinations: List[str] = Field(min_length=1, description="Ordered list of destinations (last one is final destination)")
    start_location: Optional[str] = Field(default=None, description="Starting location")
    start_date: date = Field(description="Trip start date")
    duration_days: int = Field(ge=1, le=30, description="Trip duration")
    budget: Optional[float] = Field(default=None, ge=0, description="Budget in INR")
    travelers: Optional[List[Traveler]] = Field(default=None, description="List of travelers with age and gender")
    preferences: Optional[TripPreferences] = Field(default=None, description="User preferences")
    is_international: bool = Field(default=False, description="International trip flag")
    max_passengers: Optional[int] = Field(default=None, ge=1, description="Maximum number of passengers for trip sharing")
    transportation_mode: TransportationMode = Field(default=TransportationMode.DEFAULT, description="Preferred transportation mode")
    


class TripGenerationResponse(BaseModel):
    """Response model for trip generation"""
    success: bool = Field(default=True, description="Success status")
    trip_id: str = Field(description="Unique trip identifier")
    itinerary: "Itinerary" = Field(description="Generated itinerary")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class TripDB(BaseModel):
    """Trip database model"""
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }
    )
    
    id: Optional[str] = Field(default=None, description="MongoDB ObjectId")
    trip_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique trip ID")
    user_id: str = Field(description="User ID from Clerk")
    title: str = Field(description="Trip title")
    destinations: List[str] = Field(default_factory=list, description="Ordered list of destinations")
    destination: str = Field(description="Final destination (last item in destinations array)")
    start_location: Optional[str] = Field(default=None, description="Starting location")
    start_date: str = Field(description="Start date as ISO string")
    end_date: Optional[str] = Field(default=None, description="End date as ISO string")
    duration_days: int = Field(description="Duration in days")
    budget: Optional[float] = Field(default=None, description="Budget in INR")
    travelers: Optional[List[Traveler]] = Field(default=None, description="List of travelers with age and gender")
    is_international: bool = Field(default=False, description="International flag")
    is_saved: bool = Field(default=False, description="Saved status")
    is_public: bool = Field(default=False, description="Public visibility for sharing in community")
    itinerary_data: Dict[str, Any] = Field(description="Full itinerary data")
    tags: List[str] = Field(default_factory=list, description="Trip tags")
    max_passengers: Optional[int] = Field(default=None, description="Maximum number of passengers for trip sharing")
    transportation_mode: str = Field(default="default", description="Selected transportation mode: default, road, train, flight")
    distance_km: Optional[float] = Field(default=None, description="Distance between start and destination in kilometers")
    joined_users: List[str] = Field(default_factory=list, description="List of user IDs who joined this trip")
    joined_users_demographics: Optional[List[Dict[str, Any]]] = Field(default=None, description="Demographics of joined users (age, gender)")
    is_joined: Optional[bool] = Field(default=False, description="Flag to identify if this is a joined trip copy")
    original_trip_id: Optional[str] = Field(default=None, description="Reference to original trip if this is a joined copy")
    preferred_gender: Optional[str] = Field(default=None, description="Preferred gender for joining users: male, female, other, or None for no preference")
    age_range_min: Optional[int] = Field(default=None, ge=18, description="Minimum age for joining users (must be 18+)")
    age_range_max: Optional[int] = Field(default=None, le=120, description="Maximum age for joining users")
    custom_budget: Optional[float] = Field(default=None, description="Custom budget set by host for this trip")
    host_comments: Optional[str] = Field(default=None, description="Comments/remarks from the trip host")
    emergency_contact_number: Optional[str] = Field(default=None, description="Emergency contact number for joined trips")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Update timestamp")


class TripUpdateRequest(BaseModel):
    """Request model for updating trip"""
    title: Optional[str] = None
    is_saved: Optional[bool] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    max_passengers: Optional[int] = Field(default=None, ge=1, description="Maximum number of passengers for trip sharing")
    travelers: Optional[List[Traveler]] = None
    preferred_gender: Optional[str] = Field(default=None, description="Preferred gender for joining users: male, female, other, or None for no preference")
    age_range_min: Optional[int] = Field(default=None, ge=18, description="Minimum age for joining users (must be 18+)")
    age_range_max: Optional[int] = Field(default=None, le=120, description="Maximum age for joining users")
    custom_budget: Optional[float] = Field(default=None, description="Custom budget set by host for this trip")
    host_comments: Optional[str] = Field(default=None, description="Comments/remarks from the trip host")


class ActivityReplaceRequest(BaseModel):
    """Request model for replacing an activity"""
    day: int = Field(ge=1, description="Day number")
    activity_index: int = Field(ge=0, description="Index of activity in the day's activities list")
    new_activity_data: Dict[str, Any] = Field(description="Complete activity data to replace with (already generated from alternatives)")


class ActivityRemoveRequest(BaseModel):
    """Request model for removing an activity"""
    day: int = Field(ge=1, description="Day number")
    activity_index: int = Field(ge=0, description="Index of activity in the day's activities list")


class ActivityAlternativesRequest(BaseModel):
    """Request model for generating alternative activities"""
    day: int = Field(ge=1, description="Day number")
    activity_index: int = Field(ge=0, description="Index of activity in the day's activities list")


class ActivityAlternativesResponse(BaseModel):
    """Response model for alternative activities"""
    success: bool = Field(default=True)
    alternatives: List[Activity] = Field(description="List of alternative activities with full details")
    original_activity: Activity = Field(description="The original activity being replaced")
    message: Optional[str] = Field(default=None)


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


class JoinRequest(BaseModel):
    """Join request for a trip"""
    request_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique request ID")
    trip_id: str = Field(description="Trip ID to join")
    trip_owner_id: str = Field(description="User ID of trip owner")
    requester_id: str = Field(description="User ID of requester")
    requester_name: Optional[str] = Field(default=None, description="Name of requester")
    requester_age: int = Field(ge=1, le=120, description="Age of requester")
    requester_gender: str = Field(description="Gender of requester")
    status: str = Field(default="pending", description="Status: pending, accepted, rejected")
    trip_title: str = Field(description="Title of the trip")
    trip_destination: str = Field(description="Destination of the trip")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Request creation timestamp")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Request update timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class JoinRequestCreate(BaseModel):
    """Request model for creating a join request"""
    trip_id: str = Field(description="Trip ID to join")


class JoinRequestResponse(BaseModel):
    """Response model for join request operations"""
    success: bool = Field(default=True)
    message: Optional[str] = None
    request: Optional[JoinRequest] = None


class JoinRequestAction(BaseModel):
    """Request model for accepting/rejecting a join request"""
    request_id: str = Field(description="Join request ID")
    action: str = Field(description="Action: accept or reject")


class Notification(BaseModel):
    """Notification model"""
    notification_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique notification ID")
    user_id: str = Field(description="User ID who receives the notification")
    type: str = Field(description="Notification type: join_request, join_accepted")
    title: str = Field(description="Notification title")
    message: str = Field(description="Notification message")
    related_trip_id: Optional[str] = Field(default=None, description="Related trip ID")
    related_request_id: Optional[str] = Field(default=None, description="Related join request ID")
    requester_id: Optional[str] = Field(default=None, description="User ID of requester (for join requests)")
    requester_name: Optional[str] = Field(default=None, description="Name of requester")
    requester_age: Optional[int] = Field(default=None, description="Age of requester (populated for join requests)")
    requester_gender: Optional[str] = Field(default=None, description="Gender of requester (populated for join requests)")
    is_read: bool = Field(default=False, description="Read status")
    request_status: Optional[str] = Field(default=None, description="Status of related join request: pending, accepted, rejected")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class NotificationListResponse(BaseModel):
    """Response model for notifications list"""
    success: bool = Field(default=True)
    notifications: List[Notification] = Field(description="List of notifications")
    unread_count: int = Field(default=0, description="Count of unread notifications")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class EmergencyNumberSetup(BaseModel):
    """Request model for setting up emergency number for a joined trip"""
    trip_id: str = Field(description="Trip ID")
    emergency_contact_number: str = Field(description="Emergency contact number")


class EmergencyNumberResponse(BaseModel):
    """Response model for emergency number operations"""
    success: bool = Field(default=True)
    message: Optional[str] = None
