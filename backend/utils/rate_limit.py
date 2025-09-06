"""
Rate limiting utilities for TripOnBuddy API
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from config import settings

# Global rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.rate_limit_requests} per {settings.rate_limit_window} seconds"]
)


def get_limiter():
    """Get the global rate limiter instance"""
    return limiter
