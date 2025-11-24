/**
 * Helper for fetching photos from Google Places
 */

import { PhotoDimensions } from './types';
import { searchPlacesByName } from './textSearchHelper';

/**
 * Get a single photo for an activity/location
 * @param locationName Name of the location or activity to search for
 * @param activityName Optional activity name to refine the search
 * @returns Single photo URL or undefined if no photo found
 */
export async function getActivityPhoto(
  locationName: string,
  activityName?: string
): Promise<string | undefined> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Place } = await (window.google.maps as any).importLibrary('places');

    // Create a combined search query that includes both location and activity for better results
    const searchQuery = activityName 
      ? `${activityName} ${locationName}`
      : locationName;

    const request = {
      textQuery: searchQuery,
      fields: ['photos', 'displayName'],
    };

    const { places } = await Place.searchByText(request);

    if (!places || places.length === 0) {
      console.log(`[getActivityPhoto] No results for ${searchQuery}`);
      return undefined;
    }

    // Find the first result with photos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeWithPhoto = places.find((place: any) => place.photos && place.photos.length > 0);
    
    if (placeWithPhoto && placeWithPhoto.photos && placeWithPhoto.photos.length > 0) {
      // Get the first photo with appropriate dimensions
      const photoUrl = placeWithPhoto.photos[0].getURI({ 
        maxWidth: 800, 
        maxHeight: 600 
      });
      console.log(`[getActivityPhoto] Found photo for ${searchQuery}`);
      return photoUrl;
    } else {
      console.log(`[getActivityPhoto] No photos found for ${searchQuery}`);
      return undefined;
    }
  } catch (error) {
    console.error(`[getActivityPhoto] Error fetching photo for ${locationName}:`, error);
    return undefined;
  }
}

/**
 * Get multiple photos for a single location (for headers, carousels, etc.)
 * @param locationName Name of the location
 * @param maxPhotos Maximum number of photos to return
 * @param dimensions Photo dimensions (default: 1200x800)
 * @returns Array of photo URLs
 */
export async function getLocationPhotos(
  locationName: string,
  maxPhotos: number = 5,
  dimensions: PhotoDimensions = { maxWidth: 1200, maxHeight: 800 }
): Promise<string[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Place } = await (window.google.maps as any).importLibrary('places');

    const request = {
      textQuery: `${locationName} tourist attractions landmarks monuments`,
      fields: ['photos', 'displayName'],
    };

    const { places } = await Place.searchByText(request);

    if (!places || places.length === 0) {
      console.log(`[getLocationPhotos] No results for ${locationName}`);
      return [];
    }

    const allPhotos: string[] = [];
    
    // Collect photos from multiple places
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const place of places as any[]) {
      if (place.photos && place.photos.length > 0) {
        const photoUrls = place.photos
          .slice(0, Math.ceil(maxPhotos / places.length) + 1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((photo: any) => photo.getURI(dimensions));
        allPhotos.push(...photoUrls);
      }
      
      if (allPhotos.length >= maxPhotos) {
        break;
      }
    }
    
    console.log(`[getLocationPhotos] Found ${allPhotos.length} photos for ${locationName}`);
    return allPhotos.slice(0, maxPhotos);
  } catch (error) {
    console.error(`[getLocationPhotos] Error fetching photos for ${locationName}:`, error);
    return [];
  }
}

/**
 * Get photos for multiple locations
 * @param locations Array of location names
 * @param maxPhotosPerLocation Maximum photos to fetch per location
 * @returns Array of photo URLs from all locations
 */
export async function getPhotosForLocations(
  locations: string[],
  maxPhotosPerLocation: number = 3
): Promise<string[]> {
  const allPhotos: string[] = [];
  
  // Fetch photos for each location
  for (const location of locations) {
    try {
      const places = await searchPlacesByName(location);
      
      // Collect photos from all places found for this location
      for (const place of places) {
        if (place?.photos && place.photos.length > 0) {
          allPhotos.push(...place.photos);
        }
        
        // Stop if we have enough photos for this location
        if (allPhotos.length >= maxPhotosPerLocation) {
          break;
        }
      }
    } catch (error) {
      console.error(`Error fetching photos for ${location}:`, error);
      // Continue with other locations
    }
  }

  return allPhotos;
}

/**
 * Get photos for destinations to display in trip generation modal
 * If multiple destinations provided, randomly selects photos from all
 * @param destinations Single destination or array of destinations
 * @param maxPhotos Maximum total photos to return (minimum 6)
 * @returns Array of photo URLs
 */
export async function getDestinationPhotos(
  destinations: string | string[],
  maxPhotos: number = 10
): Promise<string[]> {
  const destArray = Array.isArray(destinations) ? destinations : [destinations];
  
  if (destArray.length === 0) {
    return [];
  }

  const allPhotos: string[] = [];
  const minPhotos = 6; // Minimum of 6 photos
  const targetPhotos = Math.max(maxPhotos, minPhotos);

  console.log(`[getDestinationPhotos] Fetching photos for:`, destArray);

  // If single destination, get photos from multiple search results
  if (destArray.length === 1) {
    const places = await searchPlacesByName(destArray[0]);
    console.log(`[getDestinationPhotos] Found ${places.length} places for ${destArray[0]}`);
    
    // Collect photos from all places found, prioritizing places with photos
    const placesWithPhotos = places.filter(p => p.photos && p.photos.length > 0);
    
    for (const place of placesWithPhotos) {
      if (place.photos) {
        // Take multiple photos from each place for variety
        const photosToTake = Math.min(place.photos.length, Math.ceil(targetPhotos / placesWithPhotos.length) + 1);
        allPhotos.push(...place.photos.slice(0, photosToTake));
      }
      
      // Stop if we have more than enough photos
      if (allPhotos.length >= targetPhotos * 1.5) {
        break;
      }
    }
    
    // Shuffle and return
    const shuffled = allPhotos.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, targetPhotos);
    console.log(`[getDestinationPhotos] Returning ${result.length} photos`);
    return result;
  }

  // For multiple destinations, get photos from all
  const photosPerLocation = Math.ceil(targetPhotos / destArray.length);
  
  // Process destinations sequentially with delay to avoid rate limiting
  for (let i = 0; i < destArray.length; i++) {
    const location = destArray[i];
    
    // Add small delay between destinations to avoid rate limiting
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const places = await searchPlacesByName(location);
    console.log(`[getDestinationPhotos] Found ${places.length} places for ${location}`);
    
    let locationPhotoCount = 0;
    const placesWithPhotos = places.filter(p => p.photos && p.photos.length > 0);
    
    // Collect photos from places for this location
    for (const place of placesWithPhotos) {
      if (place.photos) {
        const remaining = photosPerLocation - locationPhotoCount;
        const photosToAdd = place.photos.slice(0, Math.min(remaining, 3));
        allPhotos.push(...photosToAdd);
        locationPhotoCount += photosToAdd.length;
      }
      
      if (locationPhotoCount >= photosPerLocation) {
        break;
      }
    }
  }
  
  // Shuffle the photos for variety
  const shuffled = allPhotos.sort(() => Math.random() - 0.5);
  
  // Return at least minPhotos or up to targetPhotos
  const result = shuffled.slice(0, Math.max(targetPhotos, Math.min(allPhotos.length, minPhotos)));
  console.log(`[getDestinationPhotos] Returning ${result.length} photos from ${destArray.length} destinations`);
  return result;
}
