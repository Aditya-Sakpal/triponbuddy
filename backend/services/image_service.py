"""
Image scraping service for destination images
"""

import asyncio
import logging
from typing import List, Dict, Any
from urllib.parse import quote_plus
import aiohttp
from bs4 import BeautifulSoup
from config import settings
from utils.cache import cache_result

logger = logging.getLogger(__name__)


class ImageService:
    """Service for scraping and managing destination images"""

    def __init__(self):
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
        self.excluded_paths = {
            "element_pic", "icon", "badge", "sticker", "logo", "clipart", 
            "/new-", "/new_", "new-icon", "new-badge", "new-sticker",
            "pngtree.com/element", "flaticon", "freepik"
        }

    def _clean_location_for_search(self, location: str) -> str:
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

        cleaned_location = self._clean_location_for_search(location)
        
        encoded_location = quote_plus(cleaned_location)
        
        url = f"https://www.bing.com/images/search?q={encoded_location}&form=HDRSC2&first=1&tsc=ImageHoverTitle"


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
            images = self._parse_bing_images(html, max_images)
            return images

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

        for idx, element in enumerate(image_elements):
            try:
                # Extract image metadata
                data = element.get("m", "{}")
                if not data:
                    logger.debug(f"Element {idx} has no 'm' attribute")
                    continue

                # Parse JSON data
                import json
                image_data = json.loads(data)

                # Extract image URL
                image_url = image_data.get("murl")
                if not image_url:
                    logger.debug(f"Element {idx} has no 'murl' in data")
                    continue

                # Filter out watermarked images
                if self._is_watermark_source(image_url):
                    logger.debug(f"Filtered watermark image: {image_url[:50]}...")
                    continue

                # Filter out icon/badge/sticker images
                if self._is_excluded_image(image_url):
                    logger.debug(f"Filtered excluded image type: {image_url[:50]}...")
                    continue

                images.append(image_url)
                logger.debug(f"Added image {len(images)}: {image_url[:80]}...")

                # Stop when we have enough images
                if len(images) >= max_images:
                    break

            except Exception as e:
                logger.debug(f"Failed to parse image element {idx}: {str(e)}")
                continue

        return images

    def _is_watermark_source(self, url: str) -> bool:
        """Check if URL is from a watermark source"""
        return any(domain in url.lower() for domain in self.watermark_domains)

    def _is_excluded_image(self, url: str) -> bool:
        """Check if URL contains patterns indicating non-destination images (icons, badges, stickers)"""
        url_lower = url.lower()
        return any(pattern in url_lower for pattern in self.excluded_paths)

    def clear_cache(self):
        """Clear the image cache"""
        # This would need to be implemented based on cache implementation
        pass


# Global image service instance
image_service = ImageService()
