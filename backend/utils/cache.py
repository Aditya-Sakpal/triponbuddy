"""
Caching utilities for TripOnBuddy API
"""

import hashlib
from cachetools import TTLCache
from typing import Any, Dict
from pydantic import BaseModel
from config import settings

# Global cache instance
cache = TTLCache(maxsize=settings.cache_maxsize, ttl=settings.cache_ttl)


def get_cache_key(*args, **kwargs) -> str:
    """Generate a cache key from arguments"""
    def serialize_arg(arg):
        if isinstance(arg, BaseModel):
            return arg.model_dump_json()
        return str(arg)
    
    key_parts = [serialize_arg(arg) for arg in args]
    key_parts.extend(f"{k}:{serialize_arg(v)}" for k, v in sorted(kwargs.items()))
    
    # Create a hash of the concatenated key parts to ensure consistent length
    key_string = "|".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def cache_result(ttl: int = None):
    """Decorator to cache function results"""
    def decorator(func):
        cache_ttl = ttl or settings.cache_ttl
        func_cache = TTLCache(maxsize=settings.cache_maxsize, ttl=cache_ttl)

        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = get_cache_key(*args, **kwargs)
            
            # Check if result is in cache
            if cache_key in func_cache:
                return func_cache[cache_key]
            
            # Call the function and cache the result
            result = await func(*args, **kwargs)
            func_cache[cache_key] = result
            return result

        # Add cache info to function
        wrapper.cache = func_cache
        return wrapper

    return decorator


def clear_cache():
    """Clear all cached results"""
    cache.clear()


def get_cache_info() -> Dict[str, Any]:
    """Get cache statistics"""
    return {
        "maxsize": cache.maxsize,
        "ttl": cache.ttl,
        "current_size": len(cache)
    }
