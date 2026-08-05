"""
Budget estimation endpoints (Gemini stays server-side only).
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/budget", tags=["budget"])


class BudgetEstimateRequest(BaseModel):
    destinations: List[str] = Field(..., min_length=1)
    duration_days: int = Field(..., ge=1, le=60)
    start_date: str = Field(..., min_length=1)
    start_location: Optional[str] = None
    route_distance_km: Optional[float] = Field(default=None, ge=0)


class BudgetEstimateResponse(BaseModel):
    success: bool
    minimum_budget: int


@router.post("/estimate", response_model=BudgetEstimateResponse)
async def estimate_budget(payload: BudgetEstimateRequest):
    """Estimate minimum trip budget per person. Uses server-side Gemini key only."""
    if ai_service is None:
        # Fallback so frontend never needs a client Gemini key.
        daily = 2200
        distance = payload.route_distance_km if payload.route_distance_km and payload.route_distance_km > 0 else 120
        multi_stop = max(0, (len(payload.destinations) - 1) * 300)
        budget = max(500, round((payload.duration_days * daily + max(400, distance * 3.5) + multi_stop) / 100) * 100)
        return BudgetEstimateResponse(success=True, minimum_budget=budget)

    try:
        result = await ai_service.estimate_budget(
            destinations=payload.destinations,
            duration_days=payload.duration_days,
            start_date=payload.start_date,
            start_location=payload.start_location,
            route_distance_km=payload.route_distance_km,
        )
        return BudgetEstimateResponse(**result)
    except Exception as e:
        logger.error(f"Budget estimate failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to estimate budget")
