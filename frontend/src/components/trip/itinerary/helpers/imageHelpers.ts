import { apiClient } from "@/lib/api-client";
import type { Activity, Itinerary } from "@/constants";
import type { ImageMap } from "../types";

/**
 * Fetches images for activities based on their search queries
 */
export const fetchActivityImages = async (
  itinerary: Itinerary
): Promise<ImageMap> => {
  const queries = Array.from(
    new Set(
      itinerary.daily_plans?.flatMap((day) =>
        day.activities.map((act) => act.image_search_query)
      ) || []
    )
  );

  if (queries.length === 0) return {};

  const results: ImageMap = {};

  await Promise.all(
    queries.map(async (query) => {
      try {
        const res = await apiClient.post<{
          success: boolean;
          images: { url: string }[];
        }>(
          "/api/images/single",
          {},
          { location: query, max_images: 1, min_width: 300, min_height: 200 }
        );
        results[query] = res.images?.[0]?.url;
      } catch (err: unknown) {
        results[query] = undefined;
      }
    })
  );

  return results;
};

/**
 * Fetches images for alternative activities
 */
export const fetchAlternativeImages = async (
  alternatives: Activity[]
): Promise<ImageMap> => {
  const queries = alternatives.map((alt) => alt.image_search_query);
  const results: ImageMap = {};

  await Promise.all(
    queries.map(async (query) => {
      try {
        const res = await apiClient.post<{
          success: boolean;
          images: { url: string }[];
        }>(
          "/api/images/single",
          {},
          { location: query, max_images: 1, min_width: 300, min_height: 200 }
        );
        results[query] = res.images?.[0]?.url;
      } catch (err: unknown) {
        results[query] = undefined;
      }
    })
  );

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
