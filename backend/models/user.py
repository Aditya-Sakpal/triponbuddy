"""
User-related Pydantic models
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class User(BaseModel):
    """User model"""
    user_id: str = Field(..., description="User ID from Clerk")
    age: Optional[int] = Field(None, ge=18, le=120, description="User age (must be 18+)")
    gender: Optional[str] = Field(None, description="User gender: male, female, other")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "age": 25,
                "gender": "male"
            }
        }

class UserProfileUpdate(BaseModel):
    """User profile update model"""
    age: int = Field(..., ge=18, le=120, description="User age (must be 18+)")
    gender: str = Field(..., description="User gender: male, female, other")

class UserProfile(BaseModel):
    """User profile response model"""
    user_id: str = Field(..., description="User ID")
    age: Optional[int] = Field(None, description="User age")
    gender: Optional[str] = Field(None, description="User gender")

class UserProfileResponse(BaseModel):
    """Response model for user profile operations"""
    success: bool = Field(default=True)
    message: Optional[str] = None
    profile: Optional[UserProfile] = None

class UserStats(BaseModel):
    """User statistics model"""
    total_trips: int = Field(..., description="Total trips")
    saved_trips: int = Field(..., description="Saved trips")


class UserStatsResponse(BaseModel):
    """Response model for user stats"""
    success: bool = Field(default=True)
    stats: UserStats = Field(..., description="User statistics")
