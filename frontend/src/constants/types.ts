// TypeScript types matching backend Pydantic models

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Trip types
export interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  detailed_description: string;
  estimated_cost: string;
  duration: string;
  image_search_query: string;
  booking_info?: {
    required: boolean;
    url: string;
    price_range: string;
  };
  tag?: string; // arrival_departure, dining, sightseeing, shopping, entertainment, relaxation, adventure, cultural
  alternatives?: string[]; // List of alternative activity names
}

export interface DailyPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

export interface Accommodation {
  name: string;
  type: string;
  price_range: string;
  rating: string;
  location: string;
  booking_url: string;
  amenities: string[];
}

export interface TravelRoute {
  type: string;
  from: string;
  to: string;
  estimated_cost: string;
  duration: string;
  booking_url: string;
  details?: string;
}

export interface Transportation {
  routes: TravelRoute[];
}

export interface TransportationHub {
  name: string;
  type: string;
  location: string;
  distance_from_city: string;
  estimated_cost_to_reach: string;
  transportation_options: string[];
}

export interface LocalTransportation {
  type: string;
  description: string;
  estimated_cost: string;
  availability: string;
  coverage_area: string;
  booking_info?: string;
}

export interface NeighboringPlace {
  name: string;
  distance: string;
  description: string;
  time_to_reach: string;
  best_known_for: string;
  estimated_cost: string;
  image_search_query: string;
}

export interface Itinerary {
  title: string;
  destination: string;
  duration_days: number;
  start_date: string;
  estimated_total_cost: string;
  best_time_to_visit: string;
  travel_tips: string[];
  daily_plans: DailyPlan[];
  accommodation: Accommodation[];
  transportation: Transportation;
  transportation_hubs_start: TransportationHub[];
  transportation_hubs_destination: TransportationHub[];
  local_transportation: LocalTransportation[];
  neighboring_places: NeighboringPlace[];
}

export interface TripPreferences {
  adventure?: boolean;
  culture?: boolean;
  relaxation?: boolean;
  classical?: boolean;
  shopping?: boolean;
  food?: boolean;
}

export interface TripGenerationRequest {
  user_id: string;
  destination: string;
  start_location?: string;
  start_date: string; // ISO date string
  duration_days: number;
  budget?: number;
  preferences?: TripPreferences;
  is_international?: boolean;
}

export interface TripGenerationResponse {
  success: boolean;
  trip_id: string;
  itinerary: Itinerary;
  image_queries: string[];
}

export interface TripDB {
  id?: string;
  trip_id: string;
  user_id: string;
  title: string;
  destination: string;
  start_location?: string;
  start_date: string;
  end_date?: string;
  duration_days: number;
  budget?: number;
  is_international: boolean;
  is_saved: boolean;
  destination_image?: string;
  itinerary_data: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TripUpdateRequest {
  title?: string;
  is_saved?: boolean;
  tags?: string[];
}

export interface TripListResponse {
  success: boolean;
  trips: TripDB[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TripResponse {
  success: boolean;
  trip: TripDB;
}

// User types
export interface UserStats {
  total_trips: number;
  saved_trips: number;
  favorite_destinations: string[];
  recent_destinations: string[];
}

export interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
}

// Feedback types
export type FeedbackType = 'bug' | 'feature' | 'general';

export interface FeedbackCreate {
  name: string;
  email: string;
  feedback_type: FeedbackType;
  rating: number;
  feedback: string;
  page_url?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id?: string;
}

// Image types
export interface ImageData {
  url: string;
  width: number;
  height: number;
  source: string;
  title: string;
}

export interface BulkImageResponse {
  [key: string]: string[];
}

export interface SingleImageResponse {
  success: boolean;
  images: ImageData[];
  cached: boolean;
  query: string;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Query parameters
export interface TripListParams extends Record<string, unknown> {
  user_id: string;
  is_saved?: boolean;
  page?: number;
  limit?: number;
}

export interface ImageBulkParams {
  locations: string[];
}

export interface ImageSingleParams extends Record<string, unknown> {
  location: string;
  max_images?: number;
  min_width?: number;
  min_height?: number;
}

// Route Generation types
export interface RouteSegment {
  step_number: number;
  mode: string;
  from_location: string;
  to_location: string;
  description: string;
  landmarks: string[];
  estimated_time: string;
  estimated_cost: string;
  details?: string;
}

export interface RoutePlan {
  from_location: string;
  to_location: string;
  total_distance: string;
  total_time: string;
  total_cost: string;
  segments: RouteSegment[];
  tips: string[];
}

export interface RouteGenerationRequest {
  trip_id: string;
  user_id: string;
  from_location: string;
  to_locations: string[];
  destination_city: string;
}

export interface RouteGenerationResponse {
  success: boolean;
  route_plan: RoutePlan;
  message?: string;
}

export interface RouteDestination {
  location: string;
  activity: string;
  day: number;
  time: string;
}

export interface RouteDestinationsResponse {
  success: boolean;
  arrival_hotel: string;
  destinations: RouteDestination[];
  destination_city: string;
}