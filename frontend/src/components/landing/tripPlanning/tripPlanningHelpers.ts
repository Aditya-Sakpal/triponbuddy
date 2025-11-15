import type { TripPreferences, ImageData } from "@/constants";

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
 * Fetches modal images for trip generation
 */
export const fetchModalImages = (
  singleImageMutation: {
    mutate: (
      params: { location: string; max_images: number; min_width: number; min_height: number; randomize?: boolean },
      callbacks: { onSuccess: (data: { images?: ImageData[] }) => void; onError: () => void }
    ) => void;
  },
  destinations: string | string[],
  setModalImages: (images: ImageData[]) => void,
  onComplete: () => void
) => {
  // Convert destinations array to comma-separated string, or use single destination
  const locationString = Array.isArray(destinations) ? destinations.join(', ') : destinations;
  const finalDestination = Array.isArray(destinations) ? destinations[destinations.length - 1] : destinations;
  const shouldRandomize = Array.isArray(destinations) && destinations.length > 1;
  
  console.log('[fetchModalImages] Input destinations:', destinations);
  console.log('[fetchModalImages] Is array?', Array.isArray(destinations));
  console.log('[fetchModalImages] Location string:', locationString);
  console.log('[fetchModalImages] Should randomize?', shouldRandomize);
  
  singleImageMutation.mutate(
    {
      location: locationString,
      max_images: 10, // Fetch more images when multiple destinations
      min_width: 800,
      min_height: 600,
      randomize: shouldRandomize,
    },
    {
      onSuccess: (data: { images?: ImageData[] }) => {
        if (data.images && data.images.length > 0) {
          setModalImages(data.images);
        } else {
          setModalImages(getPlaceholderImages(finalDestination));
        }
        onComplete();
      },
      onError: () => {
        setModalImages(getPlaceholderImages(finalDestination));
        onComplete();
      }
    }
  );
};
