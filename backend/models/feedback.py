"""
Feedback-related Pydantic models
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class FeedbackType(str, Enum):
    """Feedback type enumeration"""
    BUG = "bug"
    FEATURE = "feature"
    GENERAL = "general"


class Feedback(BaseModel):
    """Feedback model"""
    user_id: str = Field(..., description="User ID from Clerk")
    name: str = Field(..., description="User name")
    email: EmailStr = Field(..., description="User email")
    feedback_type: FeedbackType = Field(..., description="Type of feedback")
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    feedback: str = Field(..., description="Feedback content")
    page_url: Optional[str] = Field(None, description="Page URL where feedback was given")
    user_agent: Optional[str] = Field(None, description="User agent string")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")


class FeedbackCreate(BaseModel):
    """Feedback creation model"""
    name: str = Field(..., description="User name")
    email: EmailStr = Field(..., description="User email")
    feedback_type: FeedbackType = Field(..., description="Type of feedback")
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    feedback: str = Field(..., min_length=10, description="Feedback content")
    page_url: Optional[str] = Field(None, description="Page URL")


class FeedbackResponse(BaseModel):
    """Response model for feedback"""
    success: bool = Field(default=True)
    message: str = Field(..., description="Response message")
    feedback_id: Optional[str] = Field(None, description="Feedback ID")

