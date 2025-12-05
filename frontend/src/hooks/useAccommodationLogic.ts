/**
 * Custom hooks for accommodation business logic
 */

import { useState, useEffect, useMemo } from 'react';
import { googlePlacesService } from '@/services/googlePlacesService';
import type { Accommodation } from '@/constants/types';

export interface AccommodationCategories {
  all: Accommodation[];
  budget: Accommodation[];
  midRange: Accommodation[];
  premium: Accommodation[];
  luxury: Accommodation[];
}

export interface CategoryOption {
  value: string;
  label: string;
}

/**
 * Extract minimum price from price_range string
 */
function extractMinPrice(priceRange: string): number {
  const numbers = priceRange.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 0;
  return parseInt(numbers[0], 10);
}

/**
 * Hook for categorizing accommodations by type/budget
 */
export function useAccommodationCategories(
  accommodations: Accommodation[]
): {
  categories: AccommodationCategories;
  categoryOptions: CategoryOption[];
} {
  const categories = useMemo(() => {
    const categorized: AccommodationCategories = {
      all: accommodations,
      budget: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('budget') || 
                         acc.type?.toLowerCase().includes('hostel') ||
                         acc.type?.toLowerCase().includes('guesthouse');
        const priceMatch = acc.price_range && extractMinPrice(acc.price_range) < 1500;
        return typeMatch || priceMatch;
      }),
      midRange: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('mid') || 
                         acc.type?.toLowerCase().includes('standard');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 1500 && minPrice < 3500;
        return typeMatch || priceMatch;
      }),
      premium: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('premium') || 
                         acc.type?.toLowerCase().includes('deluxe');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 3500 && minPrice < 7000;
        return typeMatch || priceMatch;
      }),
      luxury: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('luxury') || 
                         acc.type?.toLowerCase().includes('resort') ||
                         acc.type?.toLowerCase().includes('five star') ||
                         acc.type?.toLowerCase().includes('5 star');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 7000;
        return typeMatch || priceMatch;
      })
    };

    return categorized;
  }, [accommodations]);

  const categoryOptions = useMemo(() => [
    { value: "all", label: `All (${categories.all.length})` },
    { value: "budget", label: `Budget (${categories.budget.length})` },
    { value: "midRange", label: `Mid-Range (${categories.midRange.length})` },
    { value: "premium", label: `Premium (${categories.premium.length})` },
    { value: "luxury", label: `Luxury (${categories.luxury.length})` }
  ], [categories]);

  return { categories, categoryOptions };
}

/**
 * Hook for loading accommodation images
 */
export function useAccommodationImages(accommodations: Accommodation[]) {
  const [images, setImages] = useState<{ [location: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (accommodations.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const imageMap: { [key: string]: string[] } = {};
        
        // Fetch images for each accommodation location with rate limiting
        for (let i = 0; i < accommodations.length; i++) {
          const acc = accommodations[i];
          try {
            // Use accommodation name and location for better search results
            const photoUrl = await googlePlacesService.getActivityPhoto(
              acc.location,
              acc.name
            );
            imageMap[acc.location] = photoUrl ? [photoUrl] : [];
          } catch (err) {
            console.error(`Failed to fetch image for ${acc.location}:`, err);
            imageMap[acc.location] = [];
          }
          
          // Add delay between requests to avoid rate limiting
          if (i < accommodations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        setImages(imageMap);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [accommodations]);

  return { images, loading, error };
}
