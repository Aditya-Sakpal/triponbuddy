// Import React for the hook
import { useState, useEffect } from 'react';

/**
 * Google Maps API Loader Utility
 * 
 * Provides utilities for loading and managing the Google Maps JavaScript API
 * with proper error handling and initialization callbacks.
 */

interface GoogleMapsConfig {
  apiKey: string;
  libraries?: string[];
  region?: string;
  language?: string;
}

interface LoadGoogleMapsOptions {
  apiKey?: string;
  libraries?: string[];
  region?: string;
  language?: string;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private callbacks: (() => void)[] = [];

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Load Google Maps JavaScript API
   */
  async load(options: LoadGoogleMapsOptions = {}): Promise<void> {
    // If already loaded, resolve immediately
    if (this.isLoaded) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadScript(options);

    try {
      await this.loadPromise;
      this.isLoaded = true;
      this.isLoading = false;
      
      // Execute any pending callbacks
      this.callbacks.forEach(callback => callback());
      this.callbacks = [];
    } catch (error) {
      this.isLoading = false;
      this.loadPromise = null;
      throw error;
    }

    return this.loadPromise;
  }

  /**
   * Check if Google Maps API is loaded
   */
  isAPILoaded(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && !!((window as unknown as Record<string, unknown>).google as Record<string, unknown>)?.maps;
  }

  /**
   * Execute callback when Google Maps API is ready
   */
  whenReady(callback: () => void): void {
    if (this.isAPILoaded()) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  private async loadScript(options: LoadGoogleMapsOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (typeof window !== 'undefined' && ((window as unknown as Record<string, unknown>).google as Record<string, unknown>)?.maps) {
        resolve();
        return;
      }

      const {
        apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries = ['places'],
        region,
        language = 'en'
      } = options;

      if (!apiKey) {
        console.warn('Google Maps API key not provided. Using mock service.');
        resolve(); // Resolve anyway to allow mock service to work
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      // Build URL with parameters
      const params = new URLSearchParams({
        key: apiKey,
        libraries: libraries.join(','),
        language,
        loading: 'async',
        callback: 'initGoogleMaps'
      });

      if (region) {
        params.append('region', region);
      }

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

      // Set up global callback
      (window as unknown as Record<string, unknown>).initGoogleMaps = () => {
        delete (window as unknown as Record<string, unknown>).initGoogleMaps;
        resolve();
      };

      // Handle script load errors
      script.onerror = () => {
        delete (window as unknown as Record<string, unknown>).initGoogleMaps;
        reject(new Error('Failed to load Google Maps API'));
      };

      // Add script to document
      document.head.appendChild(script);
    });
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();

/**
 * React hook for loading Google Maps API
 */
export const useGoogleMaps = (options?: LoadGoogleMapsOptions) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize options to avoid infinite re-renders
  const optionsKey = JSON.stringify(options || {});

  useEffect(() => {
    let isMounted = true;

    const loadAPI = async () => {
      if (googleMapsLoader.isAPILoaded()) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await googleMapsLoader.load(options);
        if (isMounted) {
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load Google Maps'));
          setIsLoading(false);
        }
      }
    };

    loadAPI();

    return () => {
      isMounted = false;
    };
  }, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoaded, isLoading, error };
};
