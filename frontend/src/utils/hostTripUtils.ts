/**
 * Utilities for age range calculations and formatting
 */

export interface AgeRangeResult {
  ageRangeMin: number | null;
  ageRangeMax: number | null;
}

/**
 * Calculate age range min/max based on selected type
 */
export const calculateAgeRange = (
  ageRangeType: string,
  customAgeMin: number,
  customAgeMax: number
): AgeRangeResult => {
  switch (ageRangeType) {
    case "18-25":
      return { ageRangeMin: 18, ageRangeMax: 25 };
    case "26-35":
      return { ageRangeMin: 26, ageRangeMax: 35 };
    case "above-35":
      return { ageRangeMin: 36, ageRangeMax: 120 };
    case "custom":
      return { ageRangeMin: customAgeMin, ageRangeMax: customAgeMax };
    default:
      // "any" - no age restrictions
      return { ageRangeMin: null, ageRangeMax: null };
  }
};

/**
 * Get preferred gender value (null if "any")
 */
export const getPreferredGenderValue = (preferredGender: string): string | null => {
  return preferredGender === "any" ? null : preferredGender;
};

/**
 * Reset host trip form to default values
 */
export interface HostTripFormDefaults {
  selectedTripId: string;
  maxPassengers: string;
  preferredGender: string;
  ageRangeType: string;
  customAgeMin: number;
  customAgeMax: number;
  customBudget: string;
}

export const getDefaultFormValues = (): HostTripFormDefaults => ({
  selectedTripId: "",
  maxPassengers: "2",
  preferredGender: "any",
  ageRangeType: "any",
  customAgeMin: 18,
  customAgeMax: 60,
  customBudget: "",
});
