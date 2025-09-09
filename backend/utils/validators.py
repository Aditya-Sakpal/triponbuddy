"""
Validation utilities for TripOnBuddy API
"""

import re
from typing import List, Optional
from datetime import date


def validate_trip_title(title: str) -> bool:
    """Validate trip title"""
    if not title or len(title.strip()) == 0:
        return False
    return len(title) <= 200

