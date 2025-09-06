"""
User-related Pydantic models
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class UserPreferences(BaseModel):
    """User preferences model"""
    currency: str = Field(default="INR", description="Preferred currency")
    language: str = Field(default="en", description="Preferred language")
    notifications: bool = Field(default=True, description="Notification preference")


class UserProfile(BaseModel):
    """User profile model"""
    user_id: str = Field(..., description="User ID from Clerk")
    email: EmailStr = Field(..., description="User email")
    display_name: Optional[str] = Field(None, description="Display name")
    avatar_url: Optional[str] = Field(None, description="Avatar URL")
    preferences: UserPreferences = Field(default_factory=UserPreferences, description="User preferences")
    trip_count: int = Field(default=0, description="Total trips created")
    total_trips_created: int = Field(default=0, description="Total trips created")
    total_trips_saved: int = Field(default=0, description="Total trips saved")
    favorite_destinations: List[str] = Field(default_factory=list, description="Favorite destinations")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Update timestamp")


class UserProfileUpdate(BaseModel):
    """User profile update model"""
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    favorite_destinations: Optional[List[str]] = None


class UserStats(BaseModel):
    """User statistics model"""
    total_trips: int = Field(..., description="Total trips")
    saved_trips: int = Field(..., description="Saved trips")
    favorite_destinations: List[str] = Field(..., description="Favorite destinations")
    recent_destinations: List[str] = Field(..., description="Recent destinations")


class UserProfileResponse(BaseModel):
    """Response model for user profile"""
    success: bool = Field(default=True)
    profile: UserProfile = Field(..., description="User profile")


class UserStatsResponse(BaseModel):
    """Response model for user stats"""
    success: bool = Field(default=True)
    stats: UserStats = Field(..., description="User statistics")
