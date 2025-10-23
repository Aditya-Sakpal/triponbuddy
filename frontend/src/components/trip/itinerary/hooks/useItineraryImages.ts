import { useState, useEffect } from "react";
import type { Itinerary } from "@/constants";
import type { ImageMap } from "../types";
import { fetchActivityImages } from "../helpers/imageHelpers";

/**
 * Custom hook to manage activity images
 */
export const useItineraryImages = (itinerary: Itinerary) => {
  const [activityImages, setActivityImages] = useState<ImageMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const images = await fetchActivityImages(itinerary);
        setActivityImages(images);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [itinerary]);

  return { activityImages, loading, error };
};
