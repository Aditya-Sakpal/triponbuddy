/**
 * Custom hooks for accommodation autocomplete and search
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { googleMapsLoader } from "@/lib/google-maps-loader";

// --- Interfaces ---

interface AutocompleteSuggestionRequest {
  input: string;
  includedPrimaryTypes?: string[];
  includedRegionCodes?: string[];
  locationBias?: {
    radius: number;
    center: { lat: number; lng: number };
  };
  locationRestriction?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  region?: string;
  includeQueryPredictions?: boolean;
}

interface GoogleMapsPlacePrediction {
  placePrediction: {
    place: string;
    placeId: string;
    text: {
      text: string;
    };
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText: {
        text: string;
      };
    };
  };
}

interface GoogleMaps {
  places: {
    AutocompleteSuggestion?: {
      fetchAutocompleteSuggestions: (request: AutocompleteSuggestionRequest) => Promise<{ suggestions: GoogleMapsPlacePrediction[] }>;
    };
  };
  importLibrary: (library: string) => Promise<unknown>;
}

interface GoogleWindow {
  google?: {
    maps?: GoogleMaps;
  };
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
}

export interface UseAccommodationSearchReturn {
  searchQuery: string;
  predictions: PlacePrediction[];
  showPredictions: boolean;
  setShowPredictions: (show: boolean) => void;
  selectedPlace: PlaceDetails | null;
  isLoading: boolean;
  handleInputChange: (value: string) => void;
  handlePlaceSelect: (prediction: PlacePrediction) => void;
  clearSearch: () => void;
}

// --- Services ---

// Mock Google Places service for development/demo
class MockPlacesService {
  private mockSuggestions: PlacePrediction[] = [
    {
      placeId: "1",
      description: "Taj Mahal Palace, Mumbai, Maharashtra, India",
      mainText: "Taj Mahal Palace",
      secondaryText: "Mumbai, Maharashtra, India"
    },
    {
      placeId: "2", 
      description: "The Oberoi, New Delhi, Delhi, India",
      mainText: "The Oberoi",
      secondaryText: "New Delhi, Delhi, India"
    },
    {
      placeId: "3",
      description: "Rambagh Palace, Jaipur, Rajasthan, India",
      mainText: "Rambagh Palace",
      secondaryText: "Jaipur, Rajasthan, India"
    },
    {
      placeId: "4",
      description: "Wildflower Hall, Shimla, Himachal Pradesh, India", 
      mainText: "Wildflower Hall",
      secondaryText: "Shimla, Himachal Pradesh, India"
    },
    {
      placeId: "5",
      description: "Goa Marriott Resort & Spa, Panaji, Goa, India",
      mainText: "Goa Marriott Resort & Spa", 
      secondaryText: "Panaji, Goa, India"
    }
  ];

  async getPlacePredictions(query: string): Promise<PlacePrediction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query || query.length < 2) {
      return [];
    }
    
    // Filter mock suggestions based on query
    const results = this.mockSuggestions.filter(suggestion => {
      return suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
             suggestion.mainText.toLowerCase().includes(query.toLowerCase());
    }).slice(0, 8);
    
    return results;
  }
}

// Google Places service wrapper
class GooglePlacesService {
  private isServiceAvailable: boolean = false;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    const googleWindow = window as unknown as GoogleWindow;
    if (typeof window !== 'undefined' && googleWindow.google?.maps?.places) {
      try {
        // Use the new AutocompleteSuggestion API
        if (googleWindow.google.maps.places.AutocompleteSuggestion) {
          this.isServiceAvailable = true;
        }
      } catch (error) {
        console.error('❌ Failed to initialize Google Places Service:', error);
        this.isServiceAvailable = false;
      }
    } 
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.isServiceAvailable;
  }

  // Reinitialize service (useful when Google Maps loads after component mount)
  reinitialize(): void {
    this.initializeService();
  }

  // Reinitialize service if it wasn't available before
  private ensureServiceInitialized() {
    const googleWindow = window as unknown as GoogleWindow;
    if (!this.isServiceAvailable && typeof window !== 'undefined' && googleWindow.google?.maps?.places) {
      this.initializeService();
    }
  }

  async getPlacePredictions(query: string): Promise<PlacePrediction[]> {
    // Try to initialize service if not already done
    this.ensureServiceInitialized();
    
    if (!this.isServiceAvailable) {
      // Fallback to mock service if Google Maps is not available
      console.warn('Google Maps not available, using mock service');
      const mockService = new MockPlacesService();
      return mockService.getPlacePredictions(query);
    }

    // Use the new AutocompleteSuggestion API
    const googleWindow = window as unknown as GoogleWindow;
    try {
      const request: AutocompleteSuggestionRequest = {
        input: query,
        includedPrimaryTypes: ['lodging', 'resort_hotel', 'campground', 'guest_house', 'bed_and_breakfast'],
        includedRegionCodes: ['in'], // Restrict to India
        region: 'in'
      };

      const response = await googleWindow.google!.maps!.places.AutocompleteSuggestion!.fetchAutocompleteSuggestions(request);
      
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestions: PlacePrediction[] = response.suggestions
          .filter(suggestion => {
            // Filter out any malformed suggestions
            if (!suggestion.placePrediction || 
                !suggestion.placePrediction.placeId || 
                !suggestion.placePrediction.text) {
              return false;
            }
            return true;
          })
          .map((suggestion) => {
            const pred = suggestion.placePrediction;
            const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
            const secondaryText = pred.structuredFormat?.secondaryText?.text || '';
            const description = pred.text?.text || `${mainText}${secondaryText ? ', ' + secondaryText : ''}`;
            
            return {
              placeId: pred.placeId,
              description: description,
              mainText: mainText,
              secondaryText: secondaryText
            };
          });
        return suggestions;
      } else {
        return [];
      }
    } catch (error) {
      console.warn('Places API error, falling back to mock:', error);
      // Fallback to mock service on error
      const mockService = new MockPlacesService();
      return mockService.getPlacePredictions(query);
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    this.ensureServiceInitialized();
    const googleWindow = window as unknown as GoogleWindow;
    
    if (!this.isServiceAvailable) {
      // Mock details
      return {
        placeId,
        name: "Mock Place Details",
        formattedAddress: "Mock Address, India"
      };
    }

    try {
      // Use importLibrary to get the Place class
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Place } = await (googleWindow.google!.maps as any).importLibrary("places") as any;
      
      if (!Place) {
        throw new Error("Place class not found in places library");
      }

      const place = new Place({ id: placeId });

      await place.fetchFields({
        fields: ['id', 'displayName', 'formattedAddress'],
      });

      return {
        placeId: place.id || placeId,
        name: place.displayName || '',
        formattedAddress: place.formattedAddress || '',
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }
}

const placesService = new GooglePlacesService();

// --- Hook ---

export function useAccommodationSearch(): UseAccommodationSearchReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load Google Maps API on component mount
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await googleMapsLoader.load({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          libraries: ['places']
        });
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load Google Maps API:', error);
        setIsGoogleMapsLoaded(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Reinitialize places service if Google Maps was loaded after component mount
      if (isGoogleMapsLoaded && !placesService.isInitialized()) {
        placesService.reinitialize();
      }
      
      const results = await placesService.getPlacePredictions(query);
      setPredictions(results);
      setShowPredictions(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleMapsLoaded]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedPlace(null);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  }, [debouncedSearch]);

  // Handle place selection
  const handlePlaceSelect = useCallback(async (prediction: PlacePrediction) => {
    if (!prediction.placeId) return;

    // Set immediately to avoid UI lag
    const details: PlaceDetails = {
      placeId: prediction.placeId,
      name: prediction.mainText,
      formattedAddress: prediction.description,
    };
    
    setSelectedPlace(details);
    setSearchQuery(prediction.mainText);
    setShowPredictions(false);
    setPredictions([]);
    
    // Fetch full details
    try {
      const fullDetails = await placesService.getPlaceDetails(prediction.placeId);
      if (fullDetails) {
        setSelectedPlace(fullDetails);
        setSearchQuery(fullDetails.name);
      }
    } catch (error) {
      console.error('Error fetching full place details:', error);
    }
  }, []);

  // Clear search state
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setPredictions([]);
    setShowPredictions(false);
    setSelectedPlace(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    predictions,
    showPredictions,
    setShowPredictions,
    selectedPlace,
    isLoading,
    handleInputChange,
    handlePlaceSelect,
    clearSearch,
  };
}

/**
 * Hook for ensuring Google Maps API is loaded
 * (Kept for backward compatibility if used elsewhere, though useAccommodationSearch handles loading internally now)
 */
export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkGoogleMaps = async () => {
      try {
        await googleMapsLoader.load({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          libraries: ['places']
        });
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps API');
      }
    };

    checkGoogleMaps();
  }, []);

  return { isLoaded, error };
}
