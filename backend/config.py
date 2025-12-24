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
    
    # Google Maps API Configuration
    google_maps_api_key: str = Field(..., env="GOOGLE_MAPS_API_KEY")

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:8080",
        env="CORS_ORIGINS"
    )

    # Cache Configuration
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    cache_maxsize: int = Field(default=1000, env="CACHE_MAXSIZE")

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

    # Email (SMTP/Gmail) Configuration
    gmail_user: str = Field(default="triponbuddy@gmail.com", env="GMAIL_USER")
    gmail_app_password: str = Field(default="", env="GMAIL_APP_PASSWORD")
    gmail_from_email: str = Field(default="triponbuddy@gmail.com", env="GMAIL_FROM_EMAIL")
    smtp_server: str = Field(default="smtp.gmail.com", env="SMTP_SERVER")
    smtp_port: int = Field(default=587, env="SMTP_PORT")
    dev_team_email: str = Field(default="devteam@example.com", env="DEV_TEAM_EMAIL")
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
