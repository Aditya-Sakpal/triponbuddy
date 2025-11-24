"""
Google Maps API service for route calculation and distance estimation
"""

import logging
import httpx
from typing import Dict, Any, List, Optional, Tuple
from config import settings

logger = logging.getLogger(__name__)


class GoogleMapsService:
    """Service for Google Maps API interactions"""
    
    def __init__(self):
        self.api_key = settings.google_maps_api_key
        self.routes_api_url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        self.geocoding_api_url = "https://maps.googleapis.com/maps/api/geocode/json"
        self.places_api_url = "https://places.googleapis.com/v1/places:searchText"
    
    async def calculate_distance(self, origin: str, destination: str) -> Optional[float]:
        """
        Calculate distance between two locations in kilometers
        
        Args:
            origin: Starting location
            destination: Ending location
            
        Returns:
            Distance in kilometers or None if calculation fails
        """
        try:
            # First, geocode the locations to get lat/lng
            origin_coords = await self._geocode_location(origin)
            dest_coords = await self._geocode_location(destination)
            
            if not origin_coords or not dest_coords:
                logger.error(f"Failed to geocode locations: {origin} -> {destination}")
                return None
            
            # Use Routes API to get accurate distance
            distance_meters = await self._compute_route_distance(origin_coords, dest_coords)
            
            if distance_meters:
                return distance_meters / 1000  # Convert to kilometers
            
            return None
            
        except Exception as e:
            logger.error(f"Error calculating distance: {str(e)}")
            return None
    
    async def _geocode_location(self, location: str) -> Optional[Tuple[float, float]]:
        """
        Geocode a location string to lat/lng coordinates
        
        Args:
            location: Location string to geocode
            
        Returns:
            Tuple of (latitude, longitude) or None
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    self.geocoding_api_url,
                    params={
                        "address": location,
                        "key": self.api_key
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("results") and len(data["results"]) > 0:
                        location_data = data["results"][0]["geometry"]["location"]
                        return (location_data["lat"], location_data["lng"])
                
                logger.error(f"Geocoding failed for {location}: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error geocoding location {location}: {str(e)}")
            return None
    
    async def _compute_route_distance(
        self, 
        origin: Tuple[float, float], 
        destination: Tuple[float, float]
    ) -> Optional[float]:
        """
        Use Routes API to compute distance between two coordinates
        
        Args:
            origin: (latitude, longitude) tuple for origin
            destination: (latitude, longitude) tuple for destination
            
        Returns:
            Distance in meters or None
        """
        try:
            request_body = {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": origin[0],
                            "longitude": origin[1]
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": destination[0],
                            "longitude": destination[1]
                        }
                    }
                },
                "travelMode": "DRIVE",
                "routingPreference": "TRAFFIC_AWARE",
                "computeAlternativeRoutes": False,
                "languageCode": "en-US",
                "units": "METRIC"
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    self.routes_api_url,
                    json=request_body,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("routes") and len(data["routes"]) > 0:
                        return data["routes"][0].get("distanceMeters")
                
                logger.error(f"Routes API failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error computing route distance: {str(e)}")
            return None
    
    async def get_road_route_with_waypoints(
        self,
        origin: str,
        destination: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed road route with polyline and places along the way
        
        Args:
            origin: Starting location
            destination: Ending location
            
        Returns:
            Dict containing route details, polyline, and waypoints
        """
        try:
            # Geocode locations
            origin_coords = await self._geocode_location(origin)
            dest_coords = await self._geocode_location(destination)
            
            if not origin_coords or not dest_coords:
                return None
            
            # Get route with polyline
            request_body = {
                "origin": {
                    "location": {
                        "latLng": {
                            "latitude": origin_coords[0],
                            "longitude": origin_coords[1]
                        }
                    }
                },
                "destination": {
                    "location": {
                        "latLng": {
                            "latitude": dest_coords[0],
                            "longitude": dest_coords[1]
                        }
                    }
                },
                "travelMode": "DRIVE",
                "routingPreference": "TRAFFIC_AWARE",
                "computeAlternativeRoutes": False,
                "languageCode": "en-US",
                "units": "METRIC"
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs"
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    self.routes_api_url,
                    json=request_body,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("routes") and len(data["routes"]) > 0:
                        route = data["routes"][0]
                        
                        # Find interesting places along the route
                        waypoints = await self._find_places_along_route(
                            route.get("polyline", {}).get("encodedPolyline"),
                            origin_coords,
                            dest_coords
                        )
                        
                        return {
                            "distance_meters": route.get("distanceMeters"),
                            "duration": route.get("duration"),
                            "polyline": route.get("polyline", {}).get("encodedPolyline"),
                            "waypoints": waypoints,
                            "origin": {"lat": origin_coords[0], "lng": origin_coords[1]},
                            "destination": {"lat": dest_coords[0], "lng": dest_coords[1]}
                        }
                
                logger.error(f"Failed to get road route: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting road route: {str(e)}")
            return None
    
    async def _find_places_along_route(
        self,
        encoded_polyline: Optional[str],
        origin: Tuple[float, float],
        destination: Tuple[float, float]
    ) -> List[Dict[str, Any]]:
        """
        Find interesting places (hotels, restaurants, attractions) along a route
        
        Args:
            encoded_polyline: Encoded polyline of the route
            origin: Origin coordinates
            destination: Destination coordinates
            
        Returns:
            List of interesting places
        """
        waypoints = []
        
        if not encoded_polyline:
            return waypoints
        
        try:
            # Decode polyline to get intermediate points
            # For simplicity, we'll search for places at intermediate lat/lng points
            # In a production app, you'd properly decode the polyline
            
            # Calculate midpoint
            mid_lat = (origin[0] + destination[0]) / 2
            mid_lng = (origin[1] + destination[1]) / 2
            
            # Search for hotels and restaurants near midpoint
            place_types = [
                {"type": "lodging", "category": "hotel"},
                {"type": "restaurant", "category": "restaurant"},
                {"type": "tourist_attraction", "category": "attraction"}
            ]
            
            for place_info in place_types:
                places = await self._search_nearby_places(
                    mid_lat, 
                    mid_lng, 
                    place_info["type"],
                    place_info["category"]
                )
                waypoints.extend(places[:3])  # Limit to 3 per category
            
            return waypoints
            
        except Exception as e:
            logger.error(f"Error finding places along route: {str(e)}")
            return []
    
    async def _search_nearby_places(
        self,
        latitude: float,
        longitude: float,
        place_type: str,
        category: str
    ) -> List[Dict[str, Any]]:
        """
        Search for places near a location using Places API
        
        Args:
            latitude: Latitude
            longitude: Longitude
            place_type: Type of place to search for
            category: Category label for the place
            
        Returns:
            List of places
        """
        try:
            request_body = {
                "textQuery": f"{place_type} near {latitude},{longitude}",
                "locationBias": {
                    "circle": {
                        "center": {
                            "latitude": latitude,
                            "longitude": longitude
                        },
                        "radius": 50000.0  # 50km radius
                    }
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.places_api_url,
                    json=request_body,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    places = []
                    
                    for place in data.get("places", [])[:5]:  # Limit to 5
                        places.append({
                            "name": place.get("displayName", {}).get("text", "Unknown"),
                            "address": place.get("formattedAddress", ""),
                            "location": place.get("location", {}),
                            "rating": place.get("rating"),
                            "category": category
                        })
                    
                    return places
                
                return []
                
        except Exception as e:
            logger.error(f"Error searching nearby places: {str(e)}")
            return []


# Create singleton instance
google_maps_service = GoogleMapsService()
