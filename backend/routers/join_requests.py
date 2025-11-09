"""
Join Requests and Notifications API router
"""

import logging
from fastapi import APIRouter, HTTPException, Query, Request

from models.trip import (
    JoinRequestCreate,
    JoinRequestResponse,
    JoinRequestAction,
    NotificationListResponse
)
from services.join_request_service import join_request_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/join-requests", tags=["join-requests"])


@router.post("", response_model=JoinRequestResponse)
async def create_join_request(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    user_name: str = Query(..., description="User name"),
    join_request: JoinRequestCreate = None
):
    """Create a join request for a trip"""
    try:
        result = await join_request_service.create_join_request(
            trip_id=join_request.trip_id,
            requester_id=user_id,
            requester_name=user_name,
            request_data=join_request
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        return JoinRequestResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating join request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create join request"
        )


@router.post("/handle", response_model=JoinRequestResponse)
async def handle_join_request(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk (trip owner)"),
    action_request: JoinRequestAction = None
):
    """Accept or reject a join request"""
    try:
        if action_request.action not in ["accepted", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid action. Must be 'accepted' or 'rejected'")

        result = await join_request_service.handle_join_request(
            request_id=action_request.request_id,
            action=action_request.action,
            trip_owner_id=user_id
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        return JoinRequestResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling join request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to handle join request"
        )


@router.get("/notifications", response_model=NotificationListResponse)
async def get_notifications(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Get all notifications for a user"""
    try:
        result = await join_request_service.get_user_notifications(user_id)
        return NotificationListResponse(**result)

    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve notifications"
        )


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    request: Request,
    notification_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """Mark a notification as read"""
    try:
        result = await join_request_service.mark_notification_read(notification_id, user_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["message"])
        
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to mark notification as read"
        )
