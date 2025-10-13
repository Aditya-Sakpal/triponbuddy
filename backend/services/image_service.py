"""
Image scraping service for destination images
"""
import asyncio
import logging
from typing import List, Dict, Any, Optional
import aiohttp
from config import settings
from utils.cache import cache_result
from services.unsplash_service import unsplash_service
from services.helpers.image_helper import (
    ImageUrlValidator,
    LocationQueryCleaner,
    ImageMetadataBuilder
)
from services.helpers.bing_parser import (
    BingImageParser,
    BingSearchUrlBuilder
)

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
        self.url_validator = ImageUrlValidator()
        self.location_cleaner = LocationQueryCleaner()
        self.metadata_builder = ImageMetadataBuilder()
        self.bing_parser = BingImageParser()
        self.url_builder = BingSearchUrlBuilder()

    @cache_result(ttl=3600)  # Cache for 1 hour
    async def fetch_bulk_images(self, locations: List[str], max_images: int = 5) -> Dict[str, List[str]]:
        """
        Fetch images for multiple locations concurrently.
        Uses Unsplash as primary source, falls back to Bing scraping.
        """

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
            # Try Unsplash first for rich metadata
            if unsplash_service.is_enabled():
                try:
                    # Use Unsplash-optimized query
                    unsplash_query = self.location_cleaner.build_search_query_for_unsplash(location)
                    logger.info(f"Unsplash search query for '{location}': {unsplash_query}")
                    
                    unsplash_results = await unsplash_service.search(
                        query=unsplash_query,
                        per_page=max_images
                    )
                    
                    if unsplash_results:
                        return self.metadata_builder.build_response_structure(
                            success=True,
                            images=[item.to_dict() for item in unsplash_results],
                            query=location,
                            source="unsplash"
                        )
                except Exception as e:
                    logger.error(f"Unsplash fetch failed for {location}: {str(e)}")

            # Fallback to Bing scraping (legacy format)
            images = await self._fetch_location_images(location, max_images)

            return self.metadata_builder.build_response_structure(
                success=True,
                images=[
                    self.metadata_builder.build_bing_metadata(url, min_width, min_height, location)
                    for url in images
                ],
                query=location,
                source="bing"
            )

        except Exception as e:
            logger.error(f"Error fetching images for {location}: {str(e)}")
            return self.metadata_builder.build_response_structure(
                success=False,
                images=[],
                query=location,
                error=str(e)
            )

    async def _fetch_location_images(self, location: str, max_images: int) -> List[str]:
        """
        Fetch images for a single location.
        Priority: Unsplash API (primary) -> Bing scraping (fallback)
        """
        images = []

        # Try Unsplash first (primary method)
        if unsplash_service.is_enabled():
            try:
                logger.info(f"Fetching images from Unsplash for: {location}")
                
                # Use Unsplash-optimized query
                unsplash_query = self.location_cleaner.build_search_query_for_unsplash(location)
                logger.info(f"Unsplash search query: {unsplash_query}")
                
                unsplash_results = await unsplash_service.search(
                    query=unsplash_query,
                    per_page=max_images
                )
                
                if unsplash_results:
                    images = [item.url for item in unsplash_results]
                    logger.info(f"Got {len(images)} images from Unsplash for: {location}")
                    return images
                else:
                    logger.info(f"No Unsplash results for {location}, falling back to Bing")
            except Exception as e:
                logger.error(f"Unsplash fetch failed for {location}: {str(e)}, falling back to Bing")

        # Fallback to Bing scraping
        logger.info(f"Fetching images from Bing for: {location}")
        
        # Use Bing-optimized query with quotes for exact matching
        bing_query = self.location_cleaner.build_search_query_for_bing(location)
        logger.info(f"Bing search query: {bing_query}")
        
        # Build URL with the optimized query (no need for manual encoding)
        url = self.url_builder.build_image_search_url(bing_query)

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

            # Parse HTML and extract images using helper
            images = self.bing_parser.parse_bing_html(html, max_images, self.url_validator)
            return images

        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching images for query: {location}")
            return []
        except Exception as e:
            logger.error(f"Error fetching images: {str(e)}")
            return []

    def clear_cache(self):
        """Clear the image cache"""
        # This would need to be implemented based on cache implementation
        pass


# Global image service instance
image_service = ImageService()
