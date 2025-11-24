import { googlePlacesService } from "@/services/googlePlacesService";
import type { Activity, Itinerary } from "@/constants";
import type { ImageMap } from "../types";

/**
 * Fetches images for activities using Google Places API
 */
export const fetchActivityImages = async (
  itinerary: Itinerary
): Promise<ImageMap> => {
  // Create a map of unique queries to activities
  const queryToActivityMap = new Map<string, Activity>();
  
  itinerary.daily_plans?.forEach((day) => {
    day.activities.forEach((act) => {
      const key = act.image_search_query;
      if (!queryToActivityMap.has(key)) {
        queryToActivityMap.set(key, act);
      }
    });
  });

  if (queryToActivityMap.size === 0) return {};

  const results: ImageMap = {};

  // Fetch images with a small delay between requests to avoid rate limiting
  const entries = Array.from(queryToActivityMap.entries());
  for (let i = 0; i < entries.length; i++) {
    const [query, activity] = entries[i];
    
    try {
      // Use the location and activity name to search for photos
      const photoUrl = await googlePlacesService.getActivityPhoto(
        activity.location,
        activity.activity
      );
      results[query] = photoUrl;
    } catch (err: unknown) {
      console.error(`Failed to fetch image for ${query}:`, err);
      results[query] = undefined;
    }
    
    // Add a small delay between requests to avoid rate limiting (except for the last one)
    if (i < entries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
};

/**
 * Fetches images for alternative activities using Google Places API
 */
export const fetchAlternativeImages = async (
  alternatives: Activity[]
): Promise<ImageMap> => {
  const results: ImageMap = {};

  // Fetch images with a small delay between requests to avoid rate limiting
  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    const query = alt.image_search_query;
    
    try {
      // Use the location and activity name to search for photos
      const photoUrl = await googlePlacesService.getActivityPhoto(
        alt.location,
        alt.activity
      );
      results[query] = photoUrl;
    } catch (err: unknown) {
      console.error(`Failed to fetch image for ${query}:`, err);
      results[query] = undefined;
    }
    
    // Add a small delay between requests to avoid rate limiting (except for the last one)
    if (i < alternatives.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
};

/**
 * Extracts unique activity search queries from itinerary
 */
export const getActivityQueries = (itinerary: Itinerary): string[] => {
  return Array.from(
    new Set(
      itinerary.daily_plans?.flatMap((day) =>
        day.activities.map((act) => act.image_search_query)
      ) || []
    )
  );
};
