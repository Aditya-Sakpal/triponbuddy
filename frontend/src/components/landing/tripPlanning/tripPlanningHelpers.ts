import type { TripPreferences, ImageData } from "@/constants";

/**
 * Generates random demo trip data
 */
export const generateDemoTripData = () => {
  const sampleDestinations = ['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Goa'];
  const sampleStartLocations = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'];
  
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
      params: { location: string; max_images: number; min_width: number; min_height: number },
      callbacks: { onSuccess: (data: { images?: ImageData[] }) => void; onError: () => void }
    ) => void;
  },
  destination: string,
  setModalImages: (images: ImageData[]) => void,
  onComplete: () => void
) => {
  singleImageMutation.mutate(
    {
      location: destination,
      max_images: 5,
      min_width: 800,
      min_height: 600,
    },
    {
      onSuccess: (data: { images?: ImageData[] }) => {
        if (data.images && data.images.length > 0) {
          setModalImages(data.images);
        } else {
          setModalImages(getPlaceholderImages(destination));
        }
        onComplete();
      },
      onError: () => {
        setModalImages(getPlaceholderImages(destination));
        onComplete();
      }
    }
  );
};
