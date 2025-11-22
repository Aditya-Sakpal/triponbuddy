import type { Itinerary, TripDB, DailyPlan, Activity } from "@/constants";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const formatTitleCase = (text: string): string => {
  if (!text) return '';

  // Replace underscores with spaces and capitalize each word
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Sanitizes price strings to extract only the numeric price range
 * Example: "₹300 - ₹1,00,000+ (Covers local transport...)" -> "₹300 - ₹1,00,000+"
 */
export const sanitizePrice = (priceString: string): string => {
  if (!priceString) return '';

  // Match pattern: ₹ followed by numbers and commas, optionally with +, possibly a range
  const match = priceString.match(/₹[\d,]+\+?(?:\s*-\s*₹[\d,]+\+?)?/);
  return match ? match[0].trim() : priceString;
};

/**
 * Parses a price string and extracts the maximum numeric value
 * Handles formats like: "₹500", "₹1,000", "₹500 - ₹1,000", "₹1,000+"
 * Returns the higher end of a range or the single value
 */
const parsePrice = (priceString: string): number => {
  if (!priceString) return 0;

  // Remove ₹ symbol and any text after (like descriptions in parentheses)
  const cleanedPrice = priceString.replace(/₹/g, '').split('(')[0].trim();

  // Handle ranges (e.g., "500 - 1,000" or "500-1000")
  if (cleanedPrice.includes('-')) {
    const parts = cleanedPrice.split('-').map(p => p.trim().replace(/,/g, '').replace(/\+/g, ''));
    // Return the higher end of the range
    return Math.max(...parts.map(p => parseFloat(p) || 0));
  }

  // Handle single values (e.g., "1,000" or "1000+")
  const numericValue = cleanedPrice.replace(/,/g, '').replace(/\+/g, '');
  return parseFloat(numericValue) || 0;
};

/**
 * Calculates the total estimated cost from all activities in a trip's itinerary
 * This is the single source of truth for budget calculation across the app
 * @param trip - The trip object or itinerary data containing daily plans with activities
 * @returns The sum of all activity estimated costs as a formatted string
 */
export const getCalculatedBudget = (trip: TripDB | { itinerary_data?: Record<string, unknown> } | Itinerary | Record<string, unknown>): string => {
  // Handle different input types
  let itinerary: Itinerary | Record<string, unknown> | undefined;
  
  if ('itinerary_data' in trip) {
    itinerary = trip.itinerary_data as Itinerary | Record<string, unknown>;
  } else {
    itinerary = trip as Itinerary | Record<string, unknown>;
  }
  
  if (!itinerary || !('daily_plans' in itinerary)) {
    return '₹0';
  }

  let totalCost = 0;

  // Sum up all activity costs from all daily plans
  (itinerary as Itinerary).daily_plans.forEach((dailyPlan: DailyPlan) => {
    if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
      dailyPlan.activities.forEach((activity: Activity) => {
        if (activity.estimated_cost) {
          totalCost += parsePrice(activity.estimated_cost);
        }
      });
    }
  });

  // Format the total cost with Indian rupee symbol and comma separators
  return `₹${totalCost.toLocaleString('en-IN')}`;
};
