"""
Image processing and validation helpers
"""

import logging
from typing import Set, Dict, Any

logger = logging.getLogger(__name__)


class ImageUrlValidator:
    """Helper class for validating image URLs"""

    def __init__(self):
        self.watermark_domains = {
            "shutterstock.com", "alamy.com", "istockphoto.com", "dreamstime.com",
            "gettyimages.com", "123rf.com", "depositphotos.com", "bigstockphoto.com"
        }
        self.excluded_paths = {
            "element_pic", "icon", "badge", "sticker", "logo", "clipart",
            "/new-", "/new_", "new-icon", "new-badge", "new-sticker",
            "pngtree.com/element", "flaticon", "freepik"
        }

    def is_watermark_source(self, url: str) -> bool:
        """Check if URL is from a watermark source"""
        return any(domain in url.lower() for domain in self.watermark_domains)

    def is_excluded_image(self, url: str) -> bool:
        """Check if URL contains patterns indicating non-destination images (icons, badges, stickers)"""
        url_lower = url.lower()
        return any(pattern in url_lower for pattern in self.excluded_paths)

    def is_valid_image(self, url: str) -> bool:
        """Check if URL is a valid, non-watermarked, non-excluded image"""
        if not url:
            return False
        if self.is_watermark_source(url):
            logger.debug(f"Filtered watermark image: {url[:50]}...")
            return False
        if self.is_excluded_image(url):
            logger.debug(f"Filtered excluded image type: {url[:50]}...")
            return False
        return True


class LocationQueryCleaner:
    """Helper class for cleaning location strings for image searches"""

    @staticmethod
    def clean_location_for_search(location: str) -> str:
        """
        Clean and simplify location string for better image search results.
        Examples:
        - "New Delhi, Delhi, India" -> "New Delhi India"
        - "New York, NY, USA" -> "New York USA"
        - "Taj Mahal" -> "Taj Mahal"
        """
        # Split by comma and take first and last parts (city and country)
        parts = [part.strip() for part in location.split(',') if part.strip()]

        if len(parts) >= 3:
            # For "City, State, Country" format, use "City Country"
            clean_location = f"{parts[0]} {parts[-1]}"
        elif len(parts) == 2:
            # For "City, Country" format, keep as is
            clean_location = f"{parts[0]} {parts[1]}"
        else:
            # Single location name, return as is
            clean_location = location.strip()

        # Add context keywords to improve search results
        # This helps avoid generic "new" images and gets actual destination photos
        return f"{clean_location} city destination travel"


class ImageMetadataBuilder:
    """Helper class for building image metadata structures"""

    @staticmethod
    def build_bing_metadata(url: str, min_width: int = 800, min_height: int = 600, location: str = "") -> Dict[str, Any]:
        """Build metadata for Bing-scraped images"""
        return {
            "url": url,
            "width": min_width,
            "height": min_height,
            "source": "bing",
            "title": f"{location} image" if location else "Destination image",
            "photographer_name": None,
            "photographer_url": None,
            "license": None,
            "attribution_html": None
        }

    @staticmethod
    def build_response_structure(
        success: bool,
        images: list,
        query: str,
        source: str = "unknown",
        error: str = None,
        cached: bool = False
    ) -> Dict[str, Any]:
        """Build standardized image service response"""
        response = {
            "success": success,
            "images": images,
            "query": query,
            "source": source,
            "cached": cached
        }
        if error:
            response["error"] = error
        return response
