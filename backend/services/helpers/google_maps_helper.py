"""
Helper functions for Google Maps Service
"""
from typing import List, Tuple

def decode_polyline(polyline_str: str) -> List[Tuple[float, float]]:
    """
    Decode Google Maps encoded polyline string
    
    Args:
        polyline_str: Encoded polyline string
        
    Returns:
        List of (latitude, longitude) tuples
    """
    index, lat, lng = 0, 0, 0
    coordinates = []
    length = len(polyline_str)
    
    while index < length:
        b, shift, result = 0, 0, 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat

        shift, result = 0, 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng

        coordinates.append((lat / 1e5, lng / 1e5))
        
    return coordinates
