"""
Image processing and validation helpers
"""

import logging
from typing import Dict, Any

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
            "pngtree.com/element", "flaticon", "freepik",
            "/diagram", "/infographic", "/vector", "/illustration",
            "network-diagram", "networking-diagram", "network-gateway"
        }
        # Additional keywords to filter out non-photographic content
        self.excluded_keywords = {
            "vector", "illustration", "diagram", "chart", "graph", "infographic",
            "clipart", "cartoon", "drawing", "sketch", "artwork", "graphic"
        }

    def is_watermark_source(self, url: str) -> bool:
        """Check if URL is from a watermark source"""
        return any(domain in url.lower() for domain in self.watermark_domains)

    def is_excluded_image(self, url: str) -> bool:
        """Check if URL contains patterns indicating non-destination images (icons, badges, stickers)"""
        url_lower = url.lower()
        
        # Check path patterns
        if any(pattern in url_lower for pattern in self.excluded_paths):
            return True
        
        # Check for non-photographic content keywords
        if any(keyword in url_lower for keyword in self.excluded_keywords):
            return True
            
        return False

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

        return clean_location

    @staticmethod
    def build_search_query_for_bing(location: str) -> str:
        """
        Build optimized search query for Bing image search.
        Uses quotes for exact phrase matching and adds specific context.
        
        Examples:
        - "New Delhi" -> '"New Delhi" India landmark'
        - "Gateway of India" -> '"Gateway of India" Mumbai landmark'
        - "Taj Mahal" -> '"Taj Mahal" Agra India'
        """
        cleaned = LocationQueryCleaner.clean_location_for_search(location)
        parts = [part.strip() for part in cleaned.split(',') if part.strip()]
        
        # Get the primary location name (first part before comma or full name)
        primary_location = parts[0] if parts else cleaned
        
        # Detect if this is a landmark vs a city
        landmark_keywords = ['temple', 'fort', 'palace', 'tower', 'gate', 'gateway', 
                           'monument', 'memorial', 'church', 'mosque', 'cathedral',
                           'mahal', 'mandir', 'gurudwara', 'shrine']
        
        is_landmark = any(keyword in primary_location.lower() for keyword in landmark_keywords)
        
        # Build query with exact phrase matching using quotes
        if is_landmark:
            # For landmarks, add more specific location context
            if len(parts) > 1:
                # e.g., "Gateway of India" + "Mumbai"
                query = f'"{primary_location}" "{parts[-1]}" landmark architecture'
            else:
                # e.g., "Taj Mahal" + "landmark"
                query = f'"{primary_location}" landmark architecture'
        else:
            # For cities, use city name with country context
            if len(parts) > 1:
                # e.g., "New Delhi" + "India"
                query = f'"{primary_location}" "{parts[-1]}" cityscape'
            else:
                # e.g., "Paris" + "cityscape"
                query = f'"{primary_location}" cityscape tourism'
        
        return query

    @staticmethod
    def build_search_query_for_unsplash(location: str) -> str:
        """
        Build optimized search query for Unsplash API.
        Unsplash works better with natural language without quotes.
        
        Examples:
        - "New Delhi, India" -> "New Delhi India architecture"
        - "Gateway of India" -> "Gateway of India Mumbai"
        - "Taj Mahal" -> "Taj Mahal Agra"
        """
        cleaned = LocationQueryCleaner.clean_location_for_search(location)
        parts = [part.strip() for part in cleaned.split(',') if part.strip()]
        
        # Get the primary location name
        primary_location = parts[0] if parts else cleaned
        
        # Detect landmark vs city
        landmark_keywords = ['temple', 'fort', 'palace', 'tower', 'gate', 'gateway',
                           'monument', 'memorial', 'church', 'mosque', 'cathedral',
                           'mahal', 'mandir', 'gurudwara', 'shrine']
        
        is_landmark = any(keyword in primary_location.lower() for keyword in landmark_keywords)
        
        # Build natural language query for Unsplash
        if is_landmark:
            if len(parts) > 1:
                query = f"{primary_location} {parts[-1]}"
            else:
                query = f"{primary_location} landmark"
        else:
            if len(parts) > 1:
                query = f"{primary_location} {parts[-1]}"
            else:
                query = f"{primary_location} city"
        
        return query


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
