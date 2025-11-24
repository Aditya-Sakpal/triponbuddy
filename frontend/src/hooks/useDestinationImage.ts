import { useState, useEffect } from "react";
import { googlePlacesService } from "@/services/googlePlacesService";

/**
 * Hook to fetch destination image from Google Places API
 */
export const useDestinationImage = (destination: string) => {
  const [destinationImage, setDestinationImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const photoUrl = await googlePlacesService.getActivityPhoto(destination);
        if (photoUrl) {
          setDestinationImage(photoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch destination image:', error);
      }
    };
    fetchImage();
  }, [destination]);

  return destinationImage;
};
