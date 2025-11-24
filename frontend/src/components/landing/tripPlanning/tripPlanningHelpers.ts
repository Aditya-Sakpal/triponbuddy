import type { TripPreferences, ImageData } from "@/constants";
import { googlePlacesService } from "@/services/googlePlacesService";

/**
 * Generates random demo trip data
 */
export const generateDemoTripData = (isInternational: boolean = false) => {
  const domesticDestinations = ['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Goa'];
  const internationalDestinations = ['Paris', 'Tokyo', 'New York', 'Dubai', 'London', 'Singapore', 'Sydney'];
  const domesticStartLocations = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'];
  const internationalStartLocations = ['New Delhi', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai'];
  
  const sampleDestinations = isInternational ? internationalDestinations : domesticDestinations;
  const sampleStartLocations = isInternational ? internationalStartLocations : domesticStartLocations;
  
  const destination = sampleDestinations[Math.floor(Math.random() * sampleDestinations.length)];
  const startLocation = sampleStartLocations[Math.floor(Math.random() * sampleStartLocations.length)];
  
  // Get a date 30 days from now
  const demoStartDate = new Date();
  demoStartDate.setDate(demoStartDate.getDate() + 30);
  const startDate = demoStartDate.toISOString().split('T')[0];
  
  return { destination, startLocation, startDate };
};

/**
 * Builds trip preferences object from selected preference labels
 */
export const buildTripPreferences = (selectedPreferences: string[]): TripPreferences => {
  return {
    adventure: selectedPreferences.includes('Adventure'),
    culture: selectedPreferences.includes('Culture'),
    relaxation: selectedPreferences.includes('Relaxation'),
    classical: selectedPreferences.includes('Classical'),
    shopping: selectedPreferences.includes('Shopping'),
    food: selectedPreferences.includes('Food'),
  };
};

/**
 * Default placeholder images for when image fetching fails
 */
const getPlaceholderImages = (destination: string): ImageData[] => [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    width: 800,
    height: 600,
    source: "unsplash",
    title: destination
  },
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    width: 800,
    height: 600,
    source: "unsplash",
    title: destination
  },
  {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
    width: 800,
    height: 600,
    source: "unsplash",
    title: destination
  }
];

/**
 * Fetches modal images for trip generation using Google Places API
 */
export const fetchModalImages = async (
  destinations: string | string[],
  setModalImages: (images: ImageData[]) => void,
  onComplete: () => void
) => {
  const finalDestination = Array.isArray(destinations) ? destinations[destinations.length - 1] : destinations;
  
  try {
    console.log('[fetchModalImages] Fetching photos for:', destinations);
    
    // Fetch photos using Google Places API
    const photoUrls = await googlePlacesService.getDestinationPhotos(destinations, 10);
    
    if (photoUrls.length > 0) {
      // Convert photo URLs to ImageData format
      const imageData: ImageData[] = photoUrls.map(url => ({
        url,
        width: 1200,
        height: 800,
        source: "google_places",
        title: finalDestination
      }));
      
      setModalImages(imageData);
      console.log('[fetchModalImages] Successfully fetched', imageData.length, 'photos');
    } else {
      // Fallback to placeholder images
      console.log('[fetchModalImages] No photos found, using placeholders');
      setModalImages(getPlaceholderImages(finalDestination));
    }
  } catch (error) {
    console.error('[fetchModalImages] Error fetching photos:', error);
    // Fallback to placeholder images on error
    setModalImages(getPlaceholderImages(finalDestination));
  } finally {
    onComplete();
  }
};
