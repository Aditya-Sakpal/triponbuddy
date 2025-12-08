/**
 * Helper for nearby places search functionality
 */

import { NearbyPlace } from './types';

/**
 * Search for places by type using the new Place.searchNearby() API
 */
export async function searchByType(
  latitude: number,
  longitude: number,
  radius: number,
  type?: string
): Promise<NearbyPlace[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Place } = await (window.google.maps as any).importLibrary('places');
    
    const request = {
      locationRestriction: {
        center: { lat: latitude, lng: longitude },
        radius,
      },
      ...(type && { includedTypes: [type] }),
      fields: ['id', 'displayName', 'photos', 'rating', 'formattedAddress', 'types', 'location', 'generativeSummary'],
    };

    const { places } = await Place.searchNearby(request);

    if (!places || places.length === 0) {
      return [];
    }

    const nearbyPlaces: NearbyPlace[] = places
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((place: any) => place.displayName && place.id && place.location)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((place: any) => ({
        id: place.id!,
        name: place.displayName!,
        photos: place.photos
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? place.photos.slice(0, 3).map((photo: any) => 
              photo.getURI({ maxWidth: 800 })
            )
          : undefined,
        rating: place.rating,
        vicinity: place.formattedAddress,
        types: place.types || [],
        location: {
          lat: place.location!.lat(),
          lng: place.location!.lng(),
        },
        generativeSummary: place.generativeSummary ? {
          overview: place.generativeSummary.overview?.text,
          overviewFlagContentUri: place.generativeSummary.overviewFlagContentUri,
          disclaimerText: place.generativeSummary.disclaimerText?.text,
        } : undefined,
      }));

    return nearbyPlaces;
  } catch (error) {
    console.error('Error searching nearby places:', error);
    return [];
  }
}

/**
 * Search for nearby interesting places using Google Places API (New Place class)
 * 
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param radius Search radius in meters (default: 50000 = 50km, max allowed by API)
 * @param limit Maximum number of results (default: 10)
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 50000,
  limit: number = 10
): Promise<NearbyPlace[]> {
  // Types that represent interesting places to visit
  const interestingTypes = [
    'tourist_attraction',
    'park',
    'museum',
    'natural_feature',
    'point_of_interest',
    'amusement_park',
    'aquarium',
    'art_gallery',
    'campground',
    'church',
    'hindu_temple',
    'mosque',
    'zoo',
  ];

  const allPlaces: NearbyPlace[] = [];
  const seenPlaceIds = new Set<string>();

  // Search for each type to get diverse results
  for (const type of interestingTypes.slice(0, 3)) {
    try {
      const places = await searchByType(latitude, longitude, radius, type);
      
      // Add unique places
      for (const place of places) {
        if (!seenPlaceIds.has(place.id) && allPlaces.length < limit) {
          seenPlaceIds.add(place.id);
          allPlaces.push(place);
        }
      }

      // Break if we have enough places
      if (allPlaces.length >= limit) {
        break;
      }
    } catch (error) {
      // Continue with other types
    }
  }

  // If we still don't have enough places, do a general search
  if (allPlaces.length < limit) {
    try {
      const generalPlaces = await searchByType(latitude, longitude, radius);
      for (const place of generalPlaces) {
        if (!seenPlaceIds.has(place.id) && allPlaces.length < limit) {
          seenPlaceIds.add(place.id);
          allPlaces.push(place);
        }
      }
    } catch (error) {
      // Silently continue
    }
  }

  return allPlaces.slice(0, limit);
}
