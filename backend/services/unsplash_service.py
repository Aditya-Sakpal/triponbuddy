import asyncio
import logging
from typing import List, Optional
import aiohttp
from config import settings
from services.helpers.unsplash_helper import (
    ImageItem,
    UnsplashResponseParser,
    UnsplashImageVerifier,
    UnsplashRequestBuilder
)

logger = logging.getLogger(__name__)


class UnsplashService:

    def __init__(self):
        self.api_url = settings.unsplash_api_url
        self.access_key = settings.unsplash_access_key
        self.timeout = settings.unsplash_timeout
        self.per_page = settings.unsplash_per_page
        self.max_retries = 3
        self.base_backoff = 1  # seconds
        self.response_parser = UnsplashResponseParser()
        self.image_verifier = UnsplashImageVerifier()
        self.request_builder = UnsplashRequestBuilder()

    def is_enabled(self) -> bool:
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

        # Build search URL and parameters using helper
        search_url = f"{self.api_url}/search/photos"
        params = self.request_builder.build_search_params(query, 1, per_page, orientation)
        headers = self.request_builder.build_headers(self.access_key)

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

                        # Convert to ImageItem objects using helper
                        images = await self.response_parser.parse_search_results(results, query, self.image_verifier)
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


# Global Unsplash service instance
unsplash_service = UnsplashService()
