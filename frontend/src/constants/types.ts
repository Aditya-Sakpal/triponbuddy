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
  destinations: string[];
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

export interface Traveler {
  age: number;
  gender: string; // 'male', 'female', 'other'
}

export interface TripGenerationRequest {
  user_id: string;
  destinations: string[];
  start_location?: string;
  start_date: string; // ISO date string
  duration_days: number;
  budget?: number;
  travelers?: Traveler[];
  preferences?: TripPreferences;
  is_international?: boolean;
  max_passengers?: number;
}

export interface TripGenerationResponse {
  success: boolean;
  trip_id: string;
  itinerary: Itinerary;
}

export interface TripDB {
  id?: string;
  trip_id: string;
  user_id: string;
  title: string;
  destinations: string[];
  destination: string;
  start_location?: string;
  start_date: string;
  end_date?: string;
  duration_days: number;
  budget?: number;
  travelers?: Traveler[];
  is_international: boolean;
  is_saved: boolean;
  is_joined?: boolean;
  is_public?: boolean;
  itinerary_data: Record<string, unknown>;
  tags: string[];
  max_passengers?: number;
  joined_users?: string[];
  joined_users_demographics?: Array<{
    user_id: string;
    age: number;
    gender: string;
  }>;
  original_trip_id?: string;
  preferred_gender?: string;
  age_range_min?: number;
  age_range_max?: number;
  custom_budget?: number;
  host_comments?: string;
  emergency_contact_number?: string;
  created_at: string;
  updated_at: string;
}

export interface TripUpdateRequest {
  title?: string;
  is_saved?: boolean;
  is_public?: boolean;
  tags?: string[];
  max_passengers?: number;
  travelers?: Traveler[];
  preferred_gender?: string;
  age_range_min?: number;
  age_range_max?: number;
  custom_budget?: number;
  host_comments?: string;
  emergency_contact_number?: string;
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
export interface User {
  user_id: string;
  age?: number;
  gender?: string;
}

export interface UserProfile {
  user_id: string;
  age?: number;
  gender?: string;
}

export interface UserProfileUpdate {
  age: number;
  gender: string;
}

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  profile?: UserProfile;
}

export interface UserStats {
  total_trips: number;
  saved_trips: number;
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

// Join Request and Notification Types
export interface JoinRequest {
  request_id: string;
  trip_id: string;
  trip_owner_id: string;
  requester_id: string;
  requester_name?: string;
  requester_age: number;
  requester_gender: string;
  status: 'pending' | 'accepted' | 'rejected';
  trip_title: string;
  trip_destination: string;
  created_at: string;
  updated_at: string;
}

export interface JoinRequestCreate {
  trip_id: string;
}

export interface JoinRequestResponse {
  success: boolean;
  message?: string;
  request?: JoinRequest;
}

export interface JoinRequestAction {
  request_id: string;
  action: 'accepted' | 'rejected';
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: 'join_request' | 'join_accepted';
  title: string;
  message: string;
  related_trip_id?: string;
  related_request_id?: string;
  requester_id?: string;
  requester_name?: string;
  requester_age?: number;
  requester_gender?: string;
  is_read: boolean;
  request_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface NotificationListResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
}