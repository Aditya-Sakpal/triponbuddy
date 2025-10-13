"""
Unsplash image processing helpers
"""

import logging
from typing import List, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ImageItem:
    """Canonical image metadata structure"""
    url: str
    width: int = None
    height: int = None
    source: str = "unsplash"
    title: str = None
    photographer_name: str = None
    photographer_url: str = None
    license: str = "Unsplash License"
    attribution_html: str = None

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


class UnsplashResponseParser:
    """Helper class for parsing Unsplash API responses"""

    @staticmethod
    async def parse_search_results(results: List[Dict], query: str, verifier) -> List[ImageItem]:
        """
        Parse Unsplash API results into ImageItem objects.
        
        Args:
            results: List of photo objects from Unsplash API
            query: Original search query for title fallback
            verifier: Image verification helper
            
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
                attribution_html = UnsplashAttributionBuilder.build_attribution_html(
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
                if await verifier.verify_image(image_url):
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


class UnsplashAttributionBuilder:
    """Helper class for building Unsplash attribution HTML"""

    @staticmethod
    def build_attribution_html(photographer_name: str, photographer_url: str) -> str:
        """Build HTML attribution string as per Unsplash guidelines"""
        if photographer_url:
            return (
                f'Photo by <a href="{photographer_url}?utm_source=triponbuddy&utm_medium=referral">'
                f'{photographer_name}</a> on '
                f'<a href="https://unsplash.com?utm_source=triponbuddy&utm_medium=referral">Unsplash</a>'
            )
        return f"Photo by {photographer_name} on Unsplash"


class UnsplashImageVerifier:
    """Helper class for verifying Unsplash image URLs"""

    @staticmethod
    async def verify_image(url: str, session) -> bool:
        """
        Verify image URL with HEAD request to check content type and size.
        
        Args:
            url: Image URL to verify
            session: aiohttp ClientSession
            
        Returns:
            True if image is valid, False otherwise
        """
        try:
            import aiohttp
            
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


class UnsplashRequestBuilder:
    """Helper class for building Unsplash API requests"""

    @staticmethod
    def build_search_params(
        query: str,
        page: int = 1,
        per_page: int = 10,
        orientation: str = None
    ) -> Dict[str, Any]:
        """Build Unsplash search parameters"""
        params = {
            "query": query,
            "page": page,
            "per_page": per_page,
        }
        if orientation:
            params["orientation"] = orientation
        return params

    @staticmethod
    def build_headers(access_key: str) -> Dict[str, str]:
        """Build Unsplash API request headers"""
        return {
            "Authorization": f"Client-ID {access_key}",
            "Accept-Version": "v1"
        }
