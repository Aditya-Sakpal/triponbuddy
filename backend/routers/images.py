"""
Images API router
"""

import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Request

from services.image_service import image_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/images", tags=["images"])


@router.post("/bulk", response_model=Dict[str, List[str]])
async def bulk_images(request: Request, locations: List[str]):
    """Fetch images for multiple locations"""

    try:
        if not locations:
            raise HTTPException(status_code=400, detail="Empty location list provided")

        if len(locations) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 locations allowed per request")

        result = await image_service.fetch_bulk_images(locations)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching bulk images: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch images"
        )


@router.post("/single", response_model=Dict[str, Any])
async def single_image(
    request: Request,
    location: str = Query(..., description="Location to search for"),
    max_images: Optional[int] = Query(5, ge=1, le=10, description="Maximum number of images"),
    min_width: Optional[int] = Query(800, ge=100, description="Minimum image width"),
    min_height: Optional[int] = Query(600, ge=100, description="Minimum image height")
):
    """Fetch images for a single location"""

    try:
        if not location:
            raise HTTPException(status_code=400, detail="Location cannot be empty")

        result = await image_service.fetch_single_location_images(
            location=location,
            max_images=max_images,
            min_width=min_width,
            min_height=min_height
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching single image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch images"
        )
