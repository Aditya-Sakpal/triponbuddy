"""
Feedback API router
"""

import logging
from fastapi import APIRouter, HTTPException, Query

from models.feedback import (
    FeedbackCreate,
    FeedbackResponse
)
from database import mongodb

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(
    feedback_data: FeedbackCreate,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Submit user feedback"""

    try:
        # Create feedback document
        feedback_doc = {
            "user_id": user_id,
            "name": feedback_data.name,
            "email": feedback_data.email,
            "feedback_type": feedback_data.feedback_type,
            "rating": feedback_data.rating,
            "feedback": feedback_data.feedback,
            "page_url": feedback_data.page_url,
            "user_agent": None  # Would be set from request headers in production
        }

        # Save to database
        feedback_id = await mongodb.insert_one("feedback", feedback_doc)

        return FeedbackResponse(
            success=True,
            message="Feedback submitted successfully",
            feedback_id=str(feedback_id)
        )

    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit feedback"
        )


