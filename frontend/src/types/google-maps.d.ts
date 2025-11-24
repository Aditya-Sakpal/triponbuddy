declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (
            predictions: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        bounds?: LatLngBounds;
        componentRestrictions?: ComponentRestrictions;
        location?: LatLng;
        offset?: number;
        radius?: number;
        sessionToken?: AutocompleteSessionToken;
        types?: string[];
      }

      interface AutocompletePrediction {
        description: string;
        distance_meters?: number;
        matched_substrings: PredictionSubstring[];
        place_id: string;
        reference: string;
        structured_formatting: StructuredFormatting;
        terms: PredictionTerm[];
        types: string[];
      }

      interface StructuredFormatting {
        main_text: string;
        main_text_matched_substrings?: PredictionSubstring[];
        secondary_text?: string;
        secondary_text_matched_substrings?: PredictionSubstring[];
      }

      interface PredictionSubstring {
        length: number;
        offset: number;
      }

      interface PredictionTerm {
        offset: number;
        value: string;
      }

      interface ComponentRestrictions {
        country?: string | string[];
      }

      enum PlacesServiceStatus {
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
        OK = 'OK',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        ZERO_RESULTS = 'ZERO_RESULTS'
      }

      class AutocompleteSessionToken {}

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | google.maps.Map);
        
        nearbySearch(
          request: PlaceSearchRequest,
          callback: (
            results: PlaceResult[] | null,
            status: PlacesServiceStatus,
            pagination: PlaceSearchPagination | null
          ) => void
        ): void;

        getDetails(
          request: PlaceDetailsRequest,
          callback: (
            result: PlaceResult | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      interface PlaceSearchRequest {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
        keyword?: string;
        location?: LatLng | LatLngLiteral;
        maxPriceLevel?: number;
        minPriceLevel?: number;
        name?: string;
        openNow?: boolean;
        radius?: number;
        rankBy?: RankBy;
        type?: string;
        types?: string[];
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
        sessionToken?: AutocompleteSessionToken;
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        adr_address?: string;
        business_status?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        geometry?: PlaceGeometry;
        html_attributions?: string[];
        icon?: string;
        icon_background_color?: string;
        icon_mask_base_uri?: string;
        international_phone_number?: string;
        name?: string;
        opening_hours?: OpeningHours;
        permanently_closed?: boolean;
        photos?: PlacePhoto[];
        place_id?: string;
        plus_code?: PlusCode;
        price_level?: number;
        rating?: number;
        reviews?: PlaceReview[];
        types?: string[];
        url?: string;
        user_ratings_total?: number;
        utc_offset_minutes?: number;
        vicinity?: string;
        website?: string;
      }

      interface PlaceGeometry {
        location?: LatLng;
        viewport?: LatLngBounds;
      }

      interface PlacePhoto {
        height: number;
        html_attributions: string[];
        width: number;
        getUrl(opts: PhotoOptions): string;
      }

      interface PhotoOptions {
        maxHeight?: number;
        maxWidth?: number;
      }

      interface OpeningHours {
        open_now?: boolean;
        periods?: OpeningPeriod[];
        weekday_text?: string[];
        isOpen(date?: Date): boolean;
      }

      interface OpeningPeriod {
        close?: OpeningHoursTime;
        open: OpeningHoursTime;
      }

      interface OpeningHoursTime {
        day: number;
        time: string;
        hours?: number;
        minutes?: number;
        nextDate?: number;
      }

      interface PlaceReview {
        author_name: string;
        author_url?: string;
        language: string;
        profile_photo_url?: string;
        rating: number;
        relative_time_description: string;
        text: string;
        time: number;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      interface PlusCode {
        compound_code?: string;
        global_code: string;
      }

      interface PlaceSearchPagination {
        hasNextPage: boolean;
        nextPage(): void;
      }

      enum RankBy {
        PROMINENCE = 0,
        DISTANCE = 1
      }
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
    }

    interface LatLngBounds {
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds): boolean;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }
  }
}

export {};
