import { TripDB } from "@/constants";
import { SharedTrip } from "@/types/forum";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface HostTripParams {
  tripId: string;
  userId: string;
  maxPassengers: number;
  preferredGender: string | null;
  ageRangeMin: number | null;
  ageRangeMax: number | null;
  customBudget: number;
}

export interface CreateForumPostParams {
  userId: string;
  username: string;
  destination: string;
  sharedTripData: SharedTrip;
}

/**
 * Update trip to make it public and set hosting preferences
 */
export const updateTripForHosting = async (
  params: HostTripParams
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/trips/${params.tripId}?user_id=${params.userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_public: true,
        max_passengers: params.maxPassengers,
        preferred_gender: params.preferredGender,
        age_range_min: params.ageRangeMin,
        age_range_max: params.ageRangeMax,
        custom_budget: params.customBudget,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update trip settings");
  }
};

/**
 * Create a forum post announcing the hosted trip
 */
export const createHostTripForumPost = async (
  params: CreateForumPostParams
): Promise<void> => {
  const defaultMessage = `Hey everyone! I'm hosting a trip to ${params.destination} and looking for travel companions to join me. Check out the details below!`;

  const response = await fetch(
    `${API_BASE_URL}/api/forum/posts?user_id=${params.userId}&username=${params.username}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: defaultMessage,
        shared_trip: params.sharedTripData,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create post");
  }
};

/**
 * Prepare shared trip data for forum post
 */
export const prepareSharedTripData = (
  trip: TripDB,
  customBudget: number
): SharedTrip => {
  return {
    trip_id: trip.trip_id,
    destination: trip.destination,
    total_cost: `₹${customBudget.toLocaleString("en-IN")}`,
    cover_image_url: undefined,
    start_date: trip.start_date,
    end_date: trip.end_date || trip.start_date,
    duration_days: trip.duration_days,
  };
};

/**
 * Host a trip - update trip and create forum post
 */
export const hostTrip = async (
  trip: TripDB,
  hostParams: HostTripParams,
  username: string
): Promise<void> => {
  // Update trip settings
  await updateTripForHosting(hostParams);

  // Prepare and create forum post
  const sharedTripData = prepareSharedTripData(trip, hostParams.customBudget);
  await createHostTripForumPost({
    userId: hostParams.userId,
    username,
    destination: trip.destination,
    sharedTripData,
  });
};
