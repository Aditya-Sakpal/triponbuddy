"""
Bing image scraping helper
"""

import json
import logging
from typing import List
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class BingImageParser:
    """Helper class for parsing Bing image search results"""

    @staticmethod
    def parse_bing_html(html: str, max_images: int, validator) -> List[str]:
        """
        Parse Bing HTML and extract image URLs
        
        Args:
            html: HTML content from Bing image search
            max_images: Maximum number of images to return
            validator: ImageUrlValidator instance for validation
        
        Returns:
            List of validated image URLs
        """
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
                image_data = json.loads(data)

                # Extract image URL
                image_url = image_data.get("murl")
                if not image_url:
                    logger.debug(f"Element {idx} has no 'murl' in data")
                    continue

                # Filter out watermarked images
                if validator.is_watermark_source(image_url):
                    logger.debug(f"Filtered watermark image: {image_url[:50]}...")
                    continue

                # Filter out icon/badge/sticker images
                if validator.is_excluded_image(image_url):
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


class BingSearchUrlBuilder:
    """Helper class for building Bing search URLs"""

    @staticmethod
    def build_image_search_url(encoded_query: str) -> str:
        """Build Bing image search URL"""
        return f"https://www.bing.com/images/search?q={encoded_query}&form=HDRSC2&first=1&tsc=ImageHoverTitle"
