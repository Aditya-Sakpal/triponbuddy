"""
User-related Pydantic models
"""

from typing import List
from pydantic import BaseModel, Field

class UserStats(BaseModel):
    """User statistics model"""
    total_trips: int = Field(..., description="Total trips")
    saved_trips: int = Field(..., description="Saved trips")
    favorite_destinations: List[str] = Field(..., description="Favorite destinations")
    recent_destinations: List[str] = Field(..., description="Recent destinations")

class UserStatsResponse(BaseModel):
    """Response model for user stats"""
    success: bool = Field(default=True)
    stats: UserStats = Field(..., description="User statistics")
