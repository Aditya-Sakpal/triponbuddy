"""
Issue reporting HTTP router
"""
import logging
from fastapi import APIRouter, HTTPException, Request, Query, Body
from pydantic import BaseModel

from services.issue_service import issue_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/issues", tags=["issues"])


class IssueReportBody(BaseModel):
    subject: str
    message: str
    category: str | None = None  # expected: 'technical' or 'personal' for joined users


@router.post("/report")
async def report_issue(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk reporting the issue"),
    user_name: str = Query(..., description="User name reporting the issue"),
    trip_id: str = Query(..., description="Trip ID the issue relates to"),
    is_owner: bool = Query(False, description="Set true when reporter is the trip owner"),
    body: IssueReportBody = Body(...)
):
    """Report an issue for a trip. Behavior differs for owners vs joined users.

    - If `is_owner` is true: send internal mail and notify owner (confirmation)
    - If reporter is joined user and `category` is 'technical': send internal mail and notify owner
    - If reporter is joined user and `category` is 'personal': only notify owner with the message
    """
    try:
        if is_owner:
            result = await issue_service.report_issue_owner(user_id, user_name, trip_id, body.subject, body.message)
        else:
            if not body.category:
                raise HTTPException(status_code=400, detail="category is required for joined users (technical|personal)")
            cat = body.category.lower()
            if cat not in ("technical", "personal"):
                raise HTTPException(status_code=400, detail="Invalid category. Must be 'technical' or 'personal'")

            result = await issue_service.report_issue_joined(user_id, user_name, trip_id, body.subject, body.message, cat)

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("message", "Failed to report issue"))

        return {"success": True, "message": "Issue reported"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reporting issue: {e}")
        raise HTTPException(status_code=500, detail="Failed to report issue")
