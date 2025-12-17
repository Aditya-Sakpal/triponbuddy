"""
Google Maps API service for route calculation and distance estimation
"""

import logging
import httpx
from typing import Dict, Any, List, Optional, Tuple
from config import settings

from services.helpers.google_maps_helper import decode_polyline

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
            path_points = decode_polyline(encoded_polyline)
            
            # Sample points evenly along the route for better distribution
            # Skip first and last 10% to avoid clustering near origin/destination
            num_points = len(path_points)
            if num_points < 3:
                sample_indices = list(range(num_points))
            else:
                # Skip first and last 10% of route
                start_idx = max(1, int(num_points * 0.1))
                end_idx = min(num_points - 1, int(num_points * 0.9))
                usable_points = end_idx - start_idx
                
                if usable_points < 10:
                    # For shorter routes, take fewer samples
                    num_samples = max(3, usable_points)
                    step = max(1, usable_points // num_samples)
                    sample_indices = list(range(start_idx, end_idx, step))
                else:
                    # For longer routes, take up to 10 evenly-spaced samples
                    num_samples = 10
                    step = usable_points // num_samples
                    sample_indices = [start_idx + (i * step) for i in range(num_samples)]
            
            sampled_points = [path_points[i] for i in sample_indices]
            
            # Place types to search for - prioritize viewpoints/attractions over hotels/restaurants
            # Distribution: ~60% attractions/viewpoints, ~20% restaurants, ~20% hotels
            place_types = [
                {"type": "tourist_attraction", "category": "attraction"},
                {"type": "viewpoint scenic point", "category": "viewpoint"},
                {"type": "tourist_attraction", "category": "attraction"},
                {"type": "restaurant", "category": "restaurant"},
                {"type": "historical landmark monument", "category": "attraction"},
                {"type": "natural park garden", "category": "attraction"},
                {"type": "tourist_attraction", "category": "attraction"},
                {"type": "lodging", "category": "hotel"},
                {"type": "museum cultural site", "category": "attraction"},
                {"type": "temple shrine religious site", "category": "attraction"}
            ]
            
            seen_place_ids = set()
            
            # For each sampled point, get ONE place, rotating through place types
            # This ensures even distribution along the route
            for idx, point in enumerate(sampled_points):
                # Rotate through place types to get variety
                place_info = place_types[idx % len(place_types)]
                
                places = await self._search_nearby_places(
                    point[0], 
                    point[1], 
                    place_info["type"],
                    place_info["category"]
                )
                
                # Take only the first unique place from this location
                for place in places:
                    place_id = f"{place['name']}_{place['location']['latitude']}_{place['location']['longitude']}"
                    
                    if place_id not in seen_place_ids:
                        seen_place_ids.add(place_id)
                        waypoints.append(place)
                        break  # Only take one place per sampled point

            # Calculate distances between consecutive waypoints
            if waypoints:
                prev_coords = origin
                for waypoint in waypoints:
                    curr_coords = (waypoint['location']['latitude'], waypoint['location']['longitude'])
                    
                    # Calculate distance from previous point
                    dist_meters = await self._compute_route_distance(prev_coords, curr_coords)
                    
                    if dist_meters is not None:
                        waypoint['distance_from_prev_km'] = round(dist_meters / 1000, 1)
                    else:
                        waypoint['distance_from_prev_km'] = None
                        
                    prev_coords = curr_coords

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
                "textQuery": f"{place_type}",
                "locationBias": {
                    "circle": {
                        "center": {
                            "latitude": latitude,
                            "longitude": longitude
                        },
                        "radius": 5000.0  # 5km radius
                    }
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.photos"
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
                    
                    for place in data.get("places", [])[:2]:  # Limit to 2 per point/category
                        
                        photo_ref = None
                        if place.get("photos") and len(place["photos"]) > 0:
                            photo_ref = place["photos"][0].get("name")

                        places.append({
                            "name": place.get("displayName", {}).get("text", "Unknown"),
                            "address": place.get("formattedAddress", ""),
                            "location": place.get("location", {}),
                            "rating": place.get("rating"),
                            "category": category,
                            "photo_ref": photo_ref
                        })
                    
                    return places
                
                return []
                
        except Exception as e:
            logger.error(f"Error searching nearby places: {str(e)}")
            return []


# Create singleton instance
google_maps_service = GoogleMapsService()
