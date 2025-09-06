"""
Configuration settings for TripOnBuddy Backend
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings with validation"""

    # MongoDB Configuration
    mongodb_url: str = Field(..., env="MONGODB_URL")
    mongodb_db_name: str = Field(default="triponbuddy", env="MONGODB_DB_NAME")

    # AI Configuration
    google_gemini_api_key: str = Field(..., env="GOOGLE_GEMINI_API_KEY")

    # CORS Configuration
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "https://www.triponbuddy.com"],
        env="CORS_ORIGINS"
    )

    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")  # seconds

    # Cache Configuration
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    cache_maxsize: int = Field(default=1000, env="CACHE_MAXSIZE")

    # Image Scraping Configuration
    max_concurrent_requests: int = Field(default=50, env="MAX_CONCURRENT_REQUESTS")
    image_scrape_timeout: int = Field(default=10, env="IMAGE_SCRAPE_TIMEOUT")
    max_images_per_location: int = Field(default=5, env="MAX_IMAGES_PER_LOCATION")

    # Application Configuration
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
