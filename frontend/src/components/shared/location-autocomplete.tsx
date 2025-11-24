import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { googleMapsLoader } from "@/lib/google-maps-loader";

// TypeScript interfaces for Google Maps
interface AutocompleteSuggestionRequest {
  input: string;
  includedPrimaryTypes?: string[];
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

interface PlacePrediction {
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

interface AutocompleteSuggestionResponse {
  suggestions: PlacePrediction[];
}

interface GoogleMaps {
  places: {
    AutocompleteSuggestion?: {
      fetchAutocompleteSuggestions: (request: AutocompleteSuggestionRequest) => Promise<AutocompleteSuggestionResponse>;
    };
  };
}

interface GoogleWindow {
  google?: {
    maps?: GoogleMaps;
  };
}

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  id?: string;
}

// Mock Google Places service for development/demo
class MockPlacesService {
  private mockSuggestions: LocationSuggestion[] = [
    {
      place_id: "1",
      description: "New York, NY, USA",
      structured_formatting: {
        main_text: "New York",
        secondary_text: "NY, USA"
      }
    },
    {
      place_id: "2", 
      description: "New Delhi, Delhi, India",
      structured_formatting: {
        main_text: "New Delhi",
        secondary_text: "Delhi, India"
      }
    },
    {
      place_id: "3",
      description: "London, UK",
      structured_formatting: {
        main_text: "London",
        secondary_text: "UK"
      }
    },
    {
      place_id: "4",
      description: "Paris, France", 
      structured_formatting: {
        main_text: "Paris",
        secondary_text: "France"
      }
    },
    {
      place_id: "5",
      description: "Tokyo, Japan",
      structured_formatting: {
        main_text: "Tokyo", 
        secondary_text: "Japan"
      }
    },
    {
      place_id: "6",
      description: "Mumbai, Maharashtra, India",
      structured_formatting: {
        main_text: "Mumbai",
        secondary_text: "Maharashtra, India"
      }
    },
    {
      place_id: "7",
      description: "Bangalore, Karnataka, India",
      structured_formatting: {
        main_text: "Bangalore",
        secondary_text: "Karnataka, India"
      }
    },
    {
      place_id: "8",
      description: "San Francisco, CA, USA",
      structured_formatting: {
        main_text: "San Francisco",
        secondary_text: "CA, USA"
      }
    },
    {
      place_id: "9",
      description: "Los Angeles, CA, USA",
      structured_formatting: {
        main_text: "Los Angeles",
        secondary_text: "CA, USA"
      }
    },
    {
      place_id: "10",
      description: "Sydney, NSW, Australia",
      structured_formatting: {
        main_text: "Sydney",
        secondary_text: "NSW, Australia"
      }
    },
    {
      place_id: "11",
      description: "Berlin, Germany",
      structured_formatting: {
        main_text: "Berlin",
        secondary_text: "Germany"
      }
    },
    {
      place_id: "12",
      description: "Barcelona, Spain",
      structured_formatting: {
        main_text: "Barcelona",
        secondary_text: "Spain"
      }
    }
  ];

  async getPlacePredictions(query: string): Promise<LocationSuggestion[]> {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query || query.length < 2) {
      return [];
    }
    
    // Filter mock suggestions based on query
    const results = this.mockSuggestions.filter(suggestion =>
      suggestion.description.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.structured_formatting.main_text.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5); // Limit to 5 results
    
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
    const googleWindow = window as GoogleWindow;
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
    const googleWindow = window as GoogleWindow;
    if (!this.isServiceAvailable && typeof window !== 'undefined' && googleWindow.google?.maps?.places) {
      this.initializeService();
    }
  }

  async getPlacePredictions(query: string): Promise<LocationSuggestion[]> {
    // Try to initialize service if not already done
    this.ensureServiceInitialized();
    
    if (!this.isServiceAvailable) {
      // Fallback to mock service if Google Maps is not available
      console.warn('Google Maps not available, using mock service');
      const mockService = new MockPlacesService();
      return mockService.getPlacePredictions(query);
    }

    // Use the new AutocompleteSuggestion API
    const googleWindow = window as GoogleWindow;
    try {
      const request: AutocompleteSuggestionRequest = {
        input: query,
        includedPrimaryTypes: ['locality', 'administrative_area_level_1', 'administrative_area_level_2']
      };

      const response = await googleWindow.google!.maps!.places.AutocompleteSuggestion!.fetchAutocompleteSuggestions(request);
      
      
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestions: LocationSuggestion[] = response.suggestions
          .filter(suggestion => {
            // Filter out any malformed suggestions
            // Note: suggestion itself IS the placePrediction according to the API
            return suggestion.placePrediction && 
                   suggestion.placePrediction.placeId && 
                   suggestion.placePrediction.text;
          })
          .map((suggestion) => {
            const pred = suggestion.placePrediction;
            const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
            const secondaryText = pred.structuredFormat?.secondaryText?.text || '';
            const description = pred.text?.text || `${mainText}${secondaryText ? ', ' + secondaryText : ''}`;
            
            return {
              place_id: pred.placeId,
              description: description,
              structured_formatting: {
                main_text: mainText,
                secondary_text: secondaryText
              }
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
}

const placesService = new GooglePlacesService();

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Enter location",
  className,
  disabled = false,
  required = false,
  icon,
  id
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Reinitialize places service if Google Maps was loaded after component mount
      if (isGoogleMapsLoaded && !placesService.isInitialized()) {
        placesService.reinitialize();
      }
      
      const results = await placesService.getPlacePredictions(query);
      setSuggestions(results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleMapsLoaded]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={cn(icon ? "pl-10" : "", className)}
          disabled={disabled}
          required={required}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Debug info */}




      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg bg-background">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2 h-auto text-left font-normal",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {suggestion.structured_formatting.main_text}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {suggestion.structured_formatting.secondary_text}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
