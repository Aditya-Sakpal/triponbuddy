"""
Image scraping service for destination images
"""

import asyncio
import logging
from typing import List, Dict, Any
import aiohttp
from bs4 import BeautifulSoup
from config import settings
from utils.cache import cache_result

logger = logging.getLogger(__name__)


class ImageService:
    """Service for scraping and managing destination images"""

    def __init__(self):
        self.semaphore = asyncio.Semaphore(settings.max_concurrent_requests)
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/113.0.0.0 Safari/537.36"
            )
        }
        self.watermark_domains = {
            "shutterstock.com", "alamy.com", "istockphoto.com", "dreamstime.com",
            "gettyimages.com", "123rf.com", "depositphotos.com", "bigstockphoto.com"
        }

    @cache_result(ttl=3600)  # Cache for 1 hour
    async def fetch_bulk_images(self, locations: List[str], max_images: int = 5) -> Dict[str, List[str]]:
        """Fetch images for multiple locations concurrently"""

        if len(locations) > 20:
            raise ValueError("Maximum 20 locations allowed per request")

        # Create tasks for parallel processing
        tasks = [self._fetch_location_images(loc, max_images) for loc in locations]

        # Execute tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        output = {}
        for loc, result in zip(locations, results):
            if isinstance(result, Exception):
                logger.error(f"Error fetching images for {loc}: {str(result)}")
                output[loc] = []
            else:
                output[loc] = result

        return output

    @cache_result(ttl=3600)
    async def fetch_single_location_images(
        self,
        location: str,
        max_images: int = 5,
        min_width: int = 800,
        min_height: int = 600
    ) -> Dict[str, Any]:
        """Fetch images for a single location with detailed metadata"""

        try:
            images = await self._fetch_location_images(location, max_images)

            return {
                "success": True,
                "images": [
                    {
                        "url": url,
                        "width": min_width,
                        "height": min_height,
                        "source": "bing",
                        "title": f"{location} image"
                    } for url in images
                ],
                "cached": False,
                "query": location
            }

        except Exception as e:
            logger.error(f"Error fetching images for {location}: {str(e)}")
            return {
                "success": False,
                "images": [],
                "error": str(e),
                "query": location
            }

    async def _fetch_location_images(self, location: str, max_images: int) -> List[str]:
        """Fetch images for a single location from Bing"""

        async with self.semaphore:
            url = f"https://www.bing.com/images/search?q={location}&count={max_images}"

            try:
                async with aiohttp.ClientSession(headers=self.headers) as session:
                    async with session.get(
                        url,
                        timeout=aiohttp.ClientTimeout(total=settings.image_scrape_timeout)
                    ) as response:

                        if response.status != 200:
                            logger.error(f"Bing returned status {response.status} for query: {location}")
                            return []

                        html = await response.text()

                # Parse HTML and extract images
                return self._parse_bing_images(html, max_images)

            except asyncio.TimeoutError:
                logger.error(f"Timeout fetching images for query: {location}")
                return []
            except Exception as e:
                logger.error(f"Error fetching images: {str(e)}")
                return []

    def _parse_bing_images(self, html: str, max_images: int) -> List[str]:
        """Parse Bing HTML and extract image URLs"""

        soup = BeautifulSoup(html, "html.parser")
        images = []

        # Find image elements
        image_elements = soup.select("a.iusc")

        for element in image_elements:
            try:
                # Extract image metadata
                data = element.get("m", "{}")
                if not data:
                    continue

                # Parse JSON data
                import json
                image_data = json.loads(data)

                # Extract image URL
                image_url = image_data.get("murl")
                if not image_url:
                    continue

                # Filter out watermarked images
                if self._is_watermark_source(image_url):
                    continue

                images.append(image_url)

                # Stop when we have enough images
                if len(images) >= max_images:
                    break

            except Exception as e:
                logger.debug(f"Failed to parse image element: {str(e)}")
                continue

        return images

    def _is_watermark_source(self, url: str) -> bool:
        """Check if URL is from a watermark source"""
        return any(domain in url.lower() for domain in self.watermark_domains)

    def clear_cache(self):
        """Clear the image cache"""
        # This would need to be implemented based on cache implementation
        pass


# Global image service instance
image_service = ImageService()
