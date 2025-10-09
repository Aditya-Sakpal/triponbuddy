"""
Unsplash API service for high-quality destination images
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import aiohttp
from config import settings

logger = logging.getLogger(__name__)


@dataclass
class ImageItem:
    """Canonical image metadata structure"""
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    source: str = "unsplash"
    title: Optional[str] = None
    photographer_name: Optional[str] = None
    photographer_url: Optional[str] = None
    license: Optional[str] = "Unsplash License"
    attribution_html: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response"""
        return {
            "url": self.url,
            "width": self.width,
            "height": self.height,
            "source": self.source,
            "title": self.title,
            "photographer_name": self.photographer_name,
            "photographer_url": self.photographer_url,
            "license": self.license,
            "attribution_html": self.attribution_html
        }


class UnsplashService:
    """Service for fetching images from Unsplash API"""

    def __init__(self):
        self.api_url = settings.unsplash_api_url
        self.access_key = settings.unsplash_access_key
        self.timeout = settings.unsplash_timeout
        self.per_page = settings.unsplash_per_page
        self.max_retries = 3
        self.base_backoff = 1  # seconds

    def is_enabled(self) -> bool:
        """Check if Unsplash service is configured and enabled"""
        return bool(self.access_key and self.access_key.strip())

    async def search(
        self,
        query: str,
        per_page: int = None,
        orientation: Optional[str] = None
    ) -> List[ImageItem]:
        """
        Search Unsplash for images matching the query.
        
        Args:
            query: Search query string
            per_page: Number of results to return (default: from settings)
            orientation: Optional orientation filter ('landscape', 'portrait', 'squarish')
            
        Returns:
            List of ImageItem objects with metadata
        """
        if not self.is_enabled():
            logger.warning("Unsplash service is not enabled (missing access key)")
            return []

        if per_page is None:
            per_page = min(self.per_page, 30)  # Unsplash API max is 30

        # Build search URL and parameters
        search_url = f"{self.api_url}/search/photos"
        params = {
            "query": query,
            "page": 1,
            "per_page": per_page,
        }
        if orientation:
            params["orientation"] = orientation

        headers = {
            "Authorization": f"Client-ID {self.access_key}",
            "Accept-Version": "v1"
        }

        # Attempt request with retries and exponential backoff
        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession(headers=headers) as session:
                    async with session.get(
                        search_url,
                        params=params,
                        timeout=aiohttp.ClientTimeout(total=self.timeout)
                    ) as response:
                        
                        # Handle rate limiting
                        if response.status == 429:
                            retry_after = response.headers.get("Retry-After")
                            wait_time = int(retry_after) if retry_after else (self.base_backoff * (2 ** attempt))
                            logger.warning(
                                f"Unsplash rate limit hit for query '{query}'. "
                                f"Waiting {wait_time}s before retry {attempt + 1}/{self.max_retries}"
                            )
                            await asyncio.sleep(wait_time)
                            continue

                        # Handle other errors
                        if response.status != 200:
                            logger.error(
                                f"Unsplash API returned status {response.status} for query '{query}'. "
                                f"Response: {await response.text()}"
                            )
                            return []

                        # Parse successful response
                        data = await response.json()
                        results = data.get("results", [])
                        
                        logger.info(
                            f"Unsplash search for '{query}' returned {len(results)} images "
                            f"(total available: {data.get('total', 0)})"
                        )

                        # Convert to ImageItem objects
                        images = await self._parse_results(results, query)
                        return images

            except asyncio.TimeoutError:
                logger.error(f"Timeout fetching images from Unsplash for query '{query}'")
                return []
            except aiohttp.ClientError as e:
                logger.error(f"Network error fetching from Unsplash: {str(e)}")
                return []
            except Exception as e:
                logger.error(f"Unexpected error in Unsplash search: {str(e)}", exc_info=True)
                return []

        logger.error(f"Failed to fetch from Unsplash after {self.max_retries} attempts")
        return []

    async def _parse_results(self, results: List[Dict], query: str) -> List[ImageItem]:
        """
        Parse Unsplash API results into ImageItem objects.
        
        Args:
            results: List of photo objects from Unsplash API
            query: Original search query for title fallback
            
        Returns:
            List of ImageItem objects
        """
        images = []

        for idx, photo in enumerate(results):
            try:
                # Extract URLs (prefer 'regular' for good quality and reasonable size)
                urls = photo.get("urls", {})
                image_url = urls.get("regular") or urls.get("full") or urls.get("raw")
                
                if not image_url:
                    logger.debug(f"Photo {idx} has no valid URL")
                    continue

                # Extract dimensions
                width = photo.get("width")
                height = photo.get("height")

                # Extract photographer info
                user = photo.get("user", {})
                photographer_name = user.get("name", "Unknown")
                photographer_username = user.get("username", "")
                photographer_url = user.get("links", {}).get("html", "")

                # Build attribution HTML
                attribution_html = self._build_attribution_html(
                    photographer_name,
                    photographer_url
                )

                # Use alt_description or description as title, fallback to query
                title = (
                    photo.get("alt_description") or 
                    photo.get("description") or 
                    f"{query} - Unsplash"
                )

                # Optional: Verify image with HEAD request
                if await self._verify_image(image_url):
                    image_item = ImageItem(
                        url=image_url,
                        width=width,
                        height=height,
                        source="unsplash",
                        title=title,
                        photographer_name=photographer_name,
                        photographer_url=photographer_url,
                        license="Unsplash License",
                        attribution_html=attribution_html
                    )
                    images.append(image_item)
                    logger.debug(f"Added Unsplash image {len(images)}: {title[:50]}...")
                else:
                    logger.debug(f"Image verification failed for {image_url[:50]}...")

            except Exception as e:
                logger.debug(f"Failed to parse Unsplash photo {idx}: {str(e)}")
                continue

        return images

    def _build_attribution_html(
        self,
        photographer_name: str,
        photographer_url: str
    ) -> str:
        """Build HTML attribution string as per Unsplash guidelines"""
        if photographer_url:
            return (
                f'Photo by <a href="{photographer_url}?utm_source=triponbuddy&utm_medium=referral">'
                f'{photographer_name}</a> on '
                f'<a href="https://unsplash.com?utm_source=triponbuddy&utm_medium=referral">Unsplash</a>'
            )
        return f"Photo by {photographer_name} on Unsplash"

    async def _verify_image(self, url: str) -> bool:
        """
        Verify image URL with HEAD request to check content type and size.
        
        Args:
            url: Image URL to verify
            
        Returns:
            True if image is valid, False otherwise
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.head(
                    url,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    
                    if response.status != 200:
                        return False

                    # Check content type
                    content_type = response.headers.get("Content-Type", "")
                    if not content_type.startswith("image/"):
                        logger.debug(f"Invalid content type: {content_type}")
                        return False

                    # Check content length (at least 2KB to filter out tiny images)
                    content_length = response.headers.get("Content-Length")
                    if content_length:
                        size = int(content_length)
                        if size < 2048:
                            logger.debug(f"Image too small: {size} bytes")
                            return False

                    return True

        except Exception as e:
            logger.debug(f"Image verification error: {str(e)}")
            # Don't fail on verification errors - assume valid
            return True


# Global Unsplash service instance
unsplash_service = UnsplashService()
