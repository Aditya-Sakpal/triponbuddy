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
    location: str = Query(..., description="Location(s) to search for (comma-separated for multiple)"),
    max_images: Optional[int] = Query(5, ge=1, le=50, description="Maximum number of images"),
    min_width: Optional[int] = Query(800, ge=100, description="Minimum image width"),
    min_height: Optional[int] = Query(600, ge=100, description="Minimum image height"),
    randomize: Optional[bool] = Query(False, description="Randomize images from multiple locations")
):
    """Fetch images for single or multiple locations (comma-separated)"""

    try:
        if not location:
            raise HTTPException(status_code=400, detail="Location cannot be empty")

        # Check if multiple locations are provided (comma-separated)
        locations = [loc.strip() for loc in location.split(',') if loc.strip()]
        
        # If multiple locations and randomize is True, fetch from all and randomize
        if len(locations) > 1 and randomize:
            result = await image_service.fetch_multiple_locations_randomized(
                locations=locations,
                max_images=max_images,
                min_width=min_width,
                min_height=min_height
            )
        else:
            # Single location or non-randomized
            result = await image_service.fetch_single_location_images(
                location=locations[0],
                max_images=max_images,
                min_width=min_width,
                min_height=min_height
            )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching images: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch images"
        )
