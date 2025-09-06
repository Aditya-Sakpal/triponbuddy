"""
Validation utilities for TripOnBuddy API
"""

import re
from typing import List, Optional
from datetime import date


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_date_range(start_date: date, end_date: Optional[date] = None) -> bool:
    """Validate date range"""
    if end_date and start_date >= end_date:
        return False
    if start_date < date.today():
        return False
    return True


def validate_budget(budget: Optional[float]) -> bool:
    """Validate budget amount"""
    if budget is None:
        return True
    return budget >= 0


def validate_duration(duration: int) -> bool:
    """Validate trip duration"""
    return 1 <= duration <= 30


def validate_preferences(preferences: Optional[List[str]]) -> bool:
    """Validate user preferences"""
    if not preferences:
        return True

    valid_preferences = {
        "adventure", "culture", "relaxation",
        "classical", "shopping", "food"
    }

    return all(pref in valid_preferences for pref in preferences)


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """Sanitize string input"""
    if not text:
        return ""

    # Remove potentially harmful characters
    text = re.sub(r'[<>]', '', text)

    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length]

    return text.strip()


def validate_trip_title(title: str) -> bool:
    """Validate trip title"""
    if not title or len(title.strip()) == 0:
        return False
    return len(title) <= 200

