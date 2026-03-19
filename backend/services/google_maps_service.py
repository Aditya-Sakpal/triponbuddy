
"""
Google Maps API service for route calculation and distance estimation
"""

import logging
import httpx
from typing import Dict, Any, List, Optional, Tuple
import math
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
                            dest_coords,
                            route.get("distanceMeters"),
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
        destination: Tuple[float, float],
        route_distance_meters: Optional[float] = None,
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

            # Dynamic targets by route length.
            is_short_route = route_distance_meters is not None and route_distance_meters <= 150_000
            target_max_spots = 5 if is_short_route else 10
            target_min_spots = 5 if is_short_route else 1
            
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
                
                if usable_points < target_max_spots:
                    # For shorter routes, take fewer samples
                    num_samples = max(2, usable_points)
                    step = max(1, usable_points // num_samples)
                    sample_indices = list(range(start_idx, end_idx, step))
                else:
                    # Take up to target_max_spots evenly-spaced samples
                    num_samples = target_max_spots
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

            # For long routes (>150km), keep original repo behavior:
            # enforce 10 route-near stops with focus on tourist attractions + food.
            if not is_short_route:
                seen_place_ids = set()
                category_counts: Dict[str, int] = {"attraction": 0, "restaurant": 0}
                desired_mix: Dict[str, int] = {"attraction": 5, "restaurant": 5}
                # Tourist + food focused query rotation
                long_route_types = [
                    {"type": "tourist_attraction", "category": "attraction"},
                    {"type": "restaurant", "category": "restaurant"},
                    {"type": "viewpoint scenic point", "category": "attraction"},
                    {"type": "cafe", "category": "restaurant"},
                    {"type": "historical landmark monument", "category": "attraction"},
                    {"type": "local food restaurant", "category": "restaurant"},
                ]
                # Start strict, then relax if needed to guarantee 10.
                long_plan = [(1000.0, 6000.0), (1500.0, 9000.0), (2200.0, 12000.0)]

                for corridor_m, radius_m in long_plan:
                    for idx, point in enumerate(sampled_points):
                        if len(waypoints) >= 10:
                            break

                        place_info = long_route_types[idx % len(long_route_types)]
                        places = await self._search_nearby_places(
                            point[0],
                            point[1],
                            place_info["type"],
                            place_info["category"],
                            radius_m=radius_m,
                        )

                        accepted_for_point = 0
                        for place in places:
                            loc = place.get("location") or {}
                            if "latitude" in loc and "longitude" in loc:
                                dist_to_route_m = self._min_distance_to_path_meters(
                                    float(loc["latitude"]),
                                    float(loc["longitude"]),
                                    path_points,
                                )
                                if dist_to_route_m > corridor_m:
                                    continue

                            place_id = f"{place['name']}_{place['location']['latitude']}_{place['location']['longitude']}"
                            if place_id in seen_place_ids:
                                continue

                            cat = str(place.get("category", "attraction"))
                            # Enforce balanced mix for long routes (roughly 5+5).
                            if category_counts.get(cat, 0) >= desired_mix.get(cat, 5):
                                continue

                            seen_place_ids.add(place_id)
                            waypoints.append(place)
                            category_counts[cat] = category_counts.get(cat, 0) + 1
                            accepted_for_point += 1
                            if accepted_for_point >= 2:
                                break

                    if len(waypoints) >= 10:
                        break

                # If still below 10, run a targeted fill pass for missing category first.
                if len(waypoints) < 10:
                    fill_by_category = {
                        "attraction": [
                            {"type": "tourist_attraction", "category": "attraction"},
                            {"type": "viewpoint scenic point", "category": "attraction"},
                            {"type": "historical landmark monument", "category": "attraction"},
                            {"type": "museum cultural site", "category": "attraction"},
                            {"type": "natural park garden", "category": "attraction"},
                        ],
                        "restaurant": [
                            {"type": "restaurant", "category": "restaurant"},
                            {"type": "cafe", "category": "restaurant"},
                            {"type": "local food restaurant", "category": "restaurant"},
                        ],
                    }

                    for wanted_category in ("attraction", "restaurant"):
                        while category_counts.get(wanted_category, 0) < desired_mix[wanted_category] and len(waypoints) < 10:
                            added_in_round = False
                            for point in sampled_points:
                                if category_counts.get(wanted_category, 0) >= desired_mix[wanted_category] or len(waypoints) >= 10:
                                    break
                                for ft in fill_by_category[wanted_category]:
                                    places = await self._search_nearby_places(
                                        point[0],
                                        point[1],
                                        ft["type"],
                                        ft["category"],
                                        radius_m=14000.0,
                                    )
                                    for place in places:
                                        loc = place.get("location") or {}
                                        if "latitude" in loc and "longitude" in loc:
                                            dist_to_route_m = self._min_distance_to_path_meters(
                                                float(loc["latitude"]),
                                                float(loc["longitude"]),
                                                path_points,
                                            )
                                            if dist_to_route_m > 2600.0:
                                                continue
                                        place_id = f"{place['name']}_{place['location']['latitude']}_{place['location']['longitude']}"
                                        if place_id in seen_place_ids:
                                            continue
                                        seen_place_ids.add(place_id)
                                        waypoints.append(place)
                                        category_counts[wanted_category] = category_counts.get(wanted_category, 0) + 1
                                        added_in_round = True
                                        break
                                    if added_in_round:
                                        break
                            if not added_in_round:
                                # No more unique places available for this category.
                                break

                # Calculate distances between consecutive waypoints
                if waypoints:
                    prev_coords = origin
                    for waypoint in waypoints:
                        curr_coords = (waypoint['location']['latitude'], waypoint['location']['longitude'])
                        dist_meters = await self._compute_route_distance(prev_coords, curr_coords)
                        waypoint['distance_from_prev_km'] = round(dist_meters / 1000, 1) if dist_meters is not None else None
                        prev_coords = curr_coords

                return waypoints[:10]
            
            # Adaptive search for short routes:
            # start strict (closest to route) and relax in controlled steps until at least 5 are found.
            # For longer routes, keep strict defaults.
            search_plan = (
                [(250.0, 1500.0), (400.0, 2200.0), (600.0, 3000.0)]
                if is_short_route
                else [(250.0, 1500.0)]
            )

            for corridor_m, radius_m in search_plan:
                candidate_waypoints: List[Dict[str, Any]] = []
                seen_place_ids = set()
                category_counts: Dict[str, int] = {}

                # For each sampled point, get places rotating through place types
                for idx, point in enumerate(sampled_points):
                    place_info = place_types[idx % len(place_types)]

                    places = await self._search_nearby_places(
                        point[0],
                        point[1],
                        place_info["type"],
                        place_info["category"],
                        radius_m=radius_m,
                    )

                    accepted_for_point = 0
                    for place in places:
                        loc = place.get("location") or {}
                        if "latitude" in loc and "longitude" in loc:
                            dist_to_route_m = self._min_distance_to_path_meters(
                                float(loc["latitude"]),
                                float(loc["longitude"]),
                                path_points,
                            )
                            if dist_to_route_m > corridor_m:
                                continue

                        place_id = f"{place['name']}_{place['location']['latitude']}_{place['location']['longitude']}"
                        if place_id not in seen_place_ids:
                            category = str(place.get("category", "attraction"))
                            # Maintain variety: prevent one category (e.g., restaurants) from dominating.
                            max_per_category = 2 if is_short_route else 4
                            if category_counts.get(category, 0) >= max_per_category:
                                continue

                            seen_place_ids.add(place_id)
                            candidate_waypoints.append(place)
                            category_counts[category] = category_counts.get(category, 0) + 1
                            accepted_for_point += 1
                            # Short routes: up to 2 per sampled segment.
                            # Long routes: up to 3 per sampled segment to ensure we can reach 10.
                            max_per_point = 2 if is_short_route else 3
                            if accepted_for_point >= max_per_point:
                                break

                    if len(candidate_waypoints) >= target_max_spots:
                        break

                # Keep the best result seen so far
                if len(candidate_waypoints) > len(waypoints):
                    waypoints = candidate_waypoints

                if len(waypoints) >= target_min_spots:
                    break

            # Hard minimum:
            # - short routes (<150km): ensure 5
            # - long routes (>150km): ensure 10
            if len(waypoints) < target_min_spots:
                seen_global = {
                    f"{wp.get('name')}_{(wp.get('location') or {}).get('latitude')}_{(wp.get('location') or {}).get('longitude')}"
                    for wp in waypoints
                }
                category_counts_global: Dict[str, int] = {}
                for wp in waypoints:
                    c = str(wp.get("category", "attraction"))
                    category_counts_global[c] = category_counts_global.get(c, 0) + 1
                fallback_types = [
                    {"type": "tourist_attraction", "category": "attraction"},
                    {"type": "viewpoint scenic point", "category": "viewpoint"},
                    {"type": "lodging", "category": "hotel"},
                    {"type": "museum cultural site", "category": "attraction"},
                    {"type": "historical landmark monument", "category": "attraction"},
                    {"type": "natural park garden", "category": "attraction"},
                    {"type": "temple shrine religious site", "category": "attraction"},
                    {"type": "restaurant", "category": "restaurant"},
                    {"type": "cafe", "category": "restaurant"},
                    {"type": "gas station", "category": "attraction"},
                ]

                # Progressively relax within reasonable bounds; still route-distance filtered.
                fallback_plan = (
                    [(900.0, 4500.0), (1200.0, 6000.0)]
                    if is_short_route
                    else [(1000.0, 7000.0), (1500.0, 10000.0), (2000.0, 12000.0)]
                )
                for corridor_m, radius_m in fallback_plan:
                    for idx, point in enumerate(sampled_points):
                        if len(waypoints) >= target_min_spots:
                            break

                        place_info = fallback_types[idx % len(fallback_types)]
                        places = await self._search_nearby_places(
                            point[0],
                            point[1],
                            place_info["type"],
                            place_info["category"],
                            radius_m=radius_m,
                        )

                        accepted_for_point = 0
                        for place in places:
                            loc = place.get("location") or {}
                            if "latitude" not in loc or "longitude" not in loc:
                                continue

                            dist_to_route_m = self._min_distance_to_path_meters(
                                float(loc["latitude"]),
                                float(loc["longitude"]),
                                path_points,
                            )
                            if dist_to_route_m > corridor_m:
                                continue

                            place_id = f"{place['name']}_{loc['latitude']}_{loc['longitude']}"
                            if place_id in seen_global:
                                continue

                            category = str(place.get("category", "attraction"))
                            # Keep fallback diverse too.
                            max_per_category = 2 if is_short_route else 4
                            if category_counts_global.get(category, 0) >= max_per_category:
                                continue

                            seen_global.add(place_id)
                            waypoints.append(place)
                            category_counts_global[category] = category_counts_global.get(category, 0) + 1
                            accepted_for_point += 1
                            max_per_point = 2 if is_short_route else 3
                            if accepted_for_point >= max_per_point:
                                break

                    if len(waypoints) >= target_min_spots:
                        break

            # Absolute guarantee for short routes: return at least 5 places.
            # This final pass progressively widens constraints to avoid returning fewer than 5.
            if is_short_route and len(waypoints) < 5:
                seen_global = {
                    f"{wp.get('name')}_{(wp.get('location') or {}).get('latitude')}_{(wp.get('location') or {}).get('longitude')}"
                    for wp in waypoints
                }
                force_types = [
                    {"type": "tourist_attraction", "category": "attraction"},
                    {"type": "viewpoint scenic point", "category": "viewpoint"},
                    {"type": "restaurant", "category": "restaurant"},
                    {"type": "lodging", "category": "hotel"},
                    {"type": "cafe", "category": "restaurant"},
                    {"type": "museum", "category": "attraction"},
                    {"type": "park", "category": "attraction"},
                ]
                force_plan = [
                    (1500.0, 8000.0),
                    (2500.0, 12000.0),
                    (4000.0, 18000.0),
                ]

                for corridor_m, radius_m in force_plan:
                    for idx, point in enumerate(sampled_points):
                        if len(waypoints) >= 5:
                            break

                        place_info = force_types[idx % len(force_types)]
                        places = await self._search_nearby_places(
                            point[0],
                            point[1],
                            place_info["type"],
                            place_info["category"],
                            radius_m=radius_m,
                        )

                        for place in places:
                            loc = place.get("location") or {}
                            if "latitude" not in loc or "longitude" not in loc:
                                continue

                            dist_to_route_m = self._min_distance_to_path_meters(
                                float(loc["latitude"]),
                                float(loc["longitude"]),
                                path_points,
                            )
                            if dist_to_route_m > corridor_m:
                                continue

                            place_id = f"{place['name']}_{loc['latitude']}_{loc['longitude']}"
                            if place_id in seen_global:
                                continue

                            seen_global.add(place_id)
                            waypoints.append(place)
                            break

                    if len(waypoints) >= 5:
                        break

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

            # Final safety cap: short routes <=5, long routes <=10.
            return waypoints[:target_max_spots]
            
        except Exception as e:
            logger.error(f"Error finding places along route: {str(e)}")
            return []
    
    async def _search_nearby_places(
        self,
        latitude: float,
        longitude: float,
        place_type: str,
        category: str,
        radius_m: float = 1500.0,
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
                # Use locationBias for compatibility with current API key/project.
                # We enforce strict on-route filtering in backend via polyline distance checks.
                "locationBias": {
                    "circle": {
                        "center": {
                            "latitude": latitude,
                            "longitude": longitude
                        },
                        "radius": radius_m
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

                if response.status_code != 200:
                    logger.warning(
                        "Places searchText failed (%s): %s",
                        response.status_code,
                        response.text[:300],
                    )
                    return []

                data = response.json()
                places = []
                
                for place in data.get("places", [])[:5]:  # Pull more candidates; route filter will narrow them.
                    
                    photo_ref = None
                    if place.get("photos") and len(place["photos"]) > 0:
                        photo_ref = place["photos"][0].get("name")

                    loc = place.get("location", {}) or {}
                    # Extra safety: filter anything outside radius.
                    if "latitude" in loc and "longitude" in loc:
                        dist_m = self._haversine_meters(
                            latitude,
                            longitude,
                            float(loc["latitude"]),
                            float(loc["longitude"]),
                        )
                        if dist_m > radius_m:
                            continue

                    places.append({
                        "name": place.get("displayName", {}).get("text", "Unknown"),
                        "address": place.get("formattedAddress", ""),
                        "location": loc,
                        "rating": place.get("rating"),
                        "category": category,
                        "photo_ref": photo_ref
                    })
                
                return places
                
        except Exception as e:
            logger.error(f"Error searching nearby places: {str(e)}")
            return []

    @staticmethod
    def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Great-circle distance between two points on Earth in meters."""
        r = 6371000.0
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    @classmethod
    def _min_distance_to_path_meters(
        cls,
        lat: float,
        lon: float,
        path_points: List[Tuple[float, float]],
    ) -> float:
        """
        Approx distance from point to route polyline in meters.
        Uses point-to-segment distance for better "on-route" accuracy.
        """
        if not path_points or len(path_points) < 2:
            return float("inf")
        min_dist = float("inf")
        for i in range(len(path_points) - 1):
            a_lat, a_lon = path_points[i]
            b_lat, b_lon = path_points[i + 1]
            dist = cls._point_to_segment_distance_meters(lat, lon, a_lat, a_lon, b_lat, b_lon)
            if dist < min_dist:
                min_dist = dist
        return min_dist

    @staticmethod
    def _point_to_segment_distance_meters(
        p_lat: float,
        p_lon: float,
        a_lat: float,
        a_lon: float,
        b_lat: float,
        b_lon: float,
    ) -> float:
        """Distance from a point to a segment in meters (local equirectangular approximation)."""
        r = 6371000.0
        lat0 = math.radians((p_lat + a_lat + b_lat) / 3.0)

        def to_xy(lat: float, lon: float) -> Tuple[float, float]:
            x = math.radians(lon) * r * math.cos(lat0)
            y = math.radians(lat) * r
            return x, y

        px, py = to_xy(p_lat, p_lon)
        ax, ay = to_xy(a_lat, a_lon)
        bx, by = to_xy(b_lat, b_lon)

        abx = bx - ax
        aby = by - ay
        apx = px - ax
        apy = py - ay
        ab_len2 = abx * abx + aby * aby

        if ab_len2 == 0:
            return math.hypot(px - ax, py - ay)

        t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab_len2))
        cx = ax + t * abx
        cy = ay + t * aby
        return math.hypot(px - cx, py - cy)


# Create singleton instance
google_maps_service = GoogleMapsService()
