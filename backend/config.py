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
    cors_origins: str = Field(
        default="http://localhost:8080",
        env="CORS_ORIGINS"
    )

    # Cache Configuration
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    cache_maxsize: int = Field(default=1000, env="CACHE_MAXSIZE")

    # Image Scraping Configuration
    image_scrape_timeout: int = Field(default=10, env="IMAGE_SCRAPE_TIMEOUT")
    max_images_per_location: int = Field(default=50, env="MAX_IMAGES_PER_LOCATION")

    # Unsplash API Configuration
    unsplash_access_key: str = Field(default="", env="UNSPLASH_ACCESS_KEY")
    unsplash_api_url: str = Field(default="https://api.unsplash.com", env="UNSPLASH_API_URL")
    unsplash_timeout: int = Field(default=10, env="UNSPLASH_TIMEOUT")
    unsplash_per_page: int = Field(default=10, env="UNSPLASH_PER_PAGE")

    # Application Configuration
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")

    # Razorpay Configuration
    razorpay_key_id: str = Field(default="", env="RAZORPAY_KEY_ID")
    razorpay_key_secret: str = Field(default="", env="RAZORPAY_KEY_SECRET")
    razorpay_webhook_secret: str = Field(default="", env="RAZORPAY_WEBHOOK_SECRET")
    razorpay_app_name: str = Field(default="TripOnBuddy Backend", env="RAZORPAY_APP_NAME")
    razorpay_app_version: str = Field(default="1.0.0", env="RAZORPAY_APP_VERSION")

    # Cloudflare R2 Configuration
    r2_access_key_id: str = Field(..., env="R2_ACCESS_KEY_ID")
    r2_secret_access_key: str = Field(..., env="R2_SECRET_ACCESS_KEY")
    r2_account_id: str = Field(..., env="R2_ACCOUNT_ID")
    r2_bucket: str = Field(..., env="R2_BUCKET")
    r2_public_url: str = Field(..., env="R2_PUBLIC_URL")  # e.g., https://pub-xxxx.r2.dev
    
    # Upload Configuration
    max_upload_size_mb: int = Field(default=10, env="MAX_UPLOAD_SIZE_MB")  # Max file size in MB

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
