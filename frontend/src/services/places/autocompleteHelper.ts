/**
 * Helper for place autocomplete functionality using the new AutocompleteSuggestion API
 */

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

/**
 * Fetch autocomplete suggestions for lodging/accommodations using the new API
 * @param input Search query text
 * @param options Optional configuration
 * @returns Array of place predictions
 */
export async function fetchAccommodationSuggestions(
  input: string,
  options?: {
    region?: string;
    includedRegionCodes?: string[];
    sessionToken?: string;
  }
): Promise<PlacePrediction[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { AutocompleteSuggestion } = await (window.google.maps as any).importLibrary('places');

    if (!input || input.trim().length === 0) {
      return [];
    }

    const request = {
      input: input.trim(),
      includedPrimaryTypes: ['lodging'],
      ...(options?.region && { region: options.region }),
      ...(options?.includedRegionCodes && { includedRegionCodes: options.includedRegionCodes }),
      ...(options?.sessionToken && { sessionToken: options.sessionToken }),
    };

    const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    if (!suggestions || suggestions.length === 0) {
      return [];
    }

    return suggestions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((suggestion: any) => suggestion.placePrediction)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((suggestion: any) => {
        const placePrediction = suggestion.placePrediction;
        return {
          placeId: placePrediction.placeId || '',
          description: placePrediction.text?.text || '',
          mainText: placePrediction.structuredFormat?.mainText?.text || '',
          secondaryText: placePrediction.structuredFormat?.secondaryText?.text || '',
        };
      });
  } catch (error) {
    console.error('Error fetching accommodation suggestions:', error);
    return [];
  }
}

/**
 * Get place details using the new Place class
 * @param placeId Google Place ID
 * @returns Place details including name and address
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Place } = await (window.google.maps as any).importLibrary('places');

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
