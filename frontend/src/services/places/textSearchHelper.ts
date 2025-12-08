/**
 * Helper for text-based place search functionality
 */

import { NearbyPlace } from './types';

/**
 * Search for places by name using Text Search (returns multiple results)
 * @param locationName Name of the place to search for
 * @param retryCount Number of retries for failed requests
 * @returns Array of places with photos
 */
export async function searchPlacesByName(
  locationName: string,
  retryCount: number = 2
): Promise<NearbyPlace[]> {
  const attemptSearch = async (retriesLeft: number): Promise<NearbyPlace[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Place } = await (window.google.maps as any).importLibrary('places');
      
      const request = {
        textQuery: `${locationName} tourist attractions landmarks monuments`,
        fields: ['id', 'displayName', 'photos', 'rating', 'formattedAddress', 'types', 'location', 'generativeSummary'],
        includedType: 'tourist_attraction',
      };

      const { places } = await Place.searchByText(request);

      if (!places || places.length === 0) {
        return [];
      }

      const nearbyPlaces: NearbyPlace[] = places
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((place: any) => place.location && place.photos)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((place: any) => ({
          id: place.id!,
          name: place.displayName || locationName,
          photos: place.photos
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? place.photos.map((photo: any) => 
                photo.getURI({ maxWidth: 1200, maxHeight: 800 })
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
      if (retriesLeft > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return attemptSearch(retriesLeft - 1);
      }
      console.error(`[searchPlacesByName] Error for ${locationName}:`, error);
      return [];
    }
  };

  return attemptSearch(retryCount);
}
