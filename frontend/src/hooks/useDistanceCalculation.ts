import { useState, useEffect } from 'react';
import { googleMapsLoader } from '@/lib/google-maps-loader';

// Type definitions for Google Maps Distance Matrix API
interface DistanceMatrixElement {
  status: string;
  distance?: {
    value: number;
    text: string;
  };
  duration?: {
    value: number;
    text: string;
  };
}

interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

interface DistanceMatrixResponse {
  rows: DistanceMatrixRow[];
}

interface GoogleMapsAPI {
  maps: {
    DistanceMatrixService: new () => {
      getDistanceMatrix: (
        request: {
          origins: string[];
          destinations: string[];
          travelMode: string;
          unitSystem: string;
        },
        callback: (response: DistanceMatrixResponse, status: string) => void
      ) => void;
    };
    TravelMode: {
      DRIVING: string;
    };
    UnitSystem: {
      METRIC: string;
    };
  };
}

interface UseDistanceCalculationProps {
  startLocation: string;
  destination: string;
  enabled?: boolean;
}

interface UseDistanceCalculationResult {
  distanceKm: number | null;
  isCalculating: boolean;
  error: string | null;
}

export const useDistanceCalculation = ({
  startLocation,
  destination,
  enabled = true,
}: UseDistanceCalculationProps): UseDistanceCalculationResult => {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset if locations are empty
    if (!startLocation || !destination || !enabled) {
      setDistanceKm(null);
      setError(null);
      return;
    }

    const calculateDistance = async () => {
      setIsCalculating(true);
      setError(null);

      try {
        // Ensure Google Maps is loaded
        await googleMapsLoader.load({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          libraries: ['places'],
        });

        // Use type assertion for google namespace
        const google = (window as unknown as { google?: GoogleMapsAPI }).google;
        if (!google || !google.maps) {
          throw new Error('Google Maps API not loaded');
        }

        const service = new google.maps.DistanceMatrixService();
        
        const response = await new Promise<DistanceMatrixResponse>((resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins: [startLocation],
              destinations: [destination],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (response: DistanceMatrixResponse, status: string) => {
              if (status === 'OK' && response) {
                resolve(response);
              } else {
                reject(new Error(`Distance calculation failed: ${status}`));
              }
            }
          );
        });

        if (
          response.rows[0] &&
          response.rows[0].elements[0] &&
          response.rows[0].elements[0].status === 'OK'
        ) {
          const distanceMeters = response.rows[0].elements[0].distance?.value;
          if (distanceMeters) {
            setDistanceKm(distanceMeters / 1000);
          } else {
            setError('Distance not available');
          }
        } else {
          setError('Unable to calculate distance');
        }
      } catch (err) {
        console.error('Error calculating distance:', err);
        setError('Failed to calculate distance');
        setDistanceKm(null);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation
    const timeoutId = setTimeout(() => {
      calculateDistance();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [startLocation, destination, enabled]);

  return { distanceKm, isCalculating, error };
};
