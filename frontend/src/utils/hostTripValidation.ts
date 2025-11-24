/**
 * Validation utilities for host trip form
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate max passengers input
 */
export const validateMaxPassengers = (
  maxPassengers: string
): ValidationResult => {
  const passengers = parseInt(maxPassengers);
  
  if (isNaN(passengers) || passengers < 1 || passengers > 10) {
    return {
      isValid: false,
      error: "Please enter a valid number of passengers (1-10)",
    };
  }
  
  return { isValid: true };
};

/**
 * Validate custom budget
 */
export const validateCustomBudget = (
  customBudget: string,
  minBudgetValue: number,
  calculatedBudget: string
): ValidationResult => {
  const budgetValue = parseFloat(customBudget);
  
  if (isNaN(budgetValue) || budgetValue < minBudgetValue) {
    return {
      isValid: false,
      error: `Budget must be at least ${calculatedBudget} (the calculated trip cost)`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validate custom age range
 */
export const validateAgeRange = (
  ageRangeType: string,
  customAgeMin: number,
  customAgeMax: number
): ValidationResult => {
  if (ageRangeType !== "custom") {
    return { isValid: true };
  }
  
  if (customAgeMin < 18 || customAgeMax > 120 || customAgeMin > customAgeMax) {
    return {
      isValid: false,
      error: "Please enter a valid age range (min 18, max 120)",
    };
  }
  
  return { isValid: true };
};

/**
 * Validate all host trip form inputs
 */
export const validateHostTripForm = (
  selectedTrip: unknown,
  maxPassengers: string,
  customBudget: string,
  minBudgetValue: number,
  calculatedBudget: string,
  ageRangeType: string,
  customAgeMin: number,
  customAgeMax: number
): ValidationResult => {
  if (!selectedTrip) {
    return {
      isValid: false,
      error: "Please select a trip to host",
    };
  }

  const passengersValidation = validateMaxPassengers(maxPassengers);
  if (!passengersValidation.isValid) {
    return passengersValidation;
  }

  const budgetValidation = validateCustomBudget(
    customBudget,
    minBudgetValue,
    calculatedBudget
  );
  if (!budgetValidation.isValid) {
    return budgetValidation;
  }

  const ageRangeValidation = validateAgeRange(
    ageRangeType,
    customAgeMin,
    customAgeMax
  );
  if (!ageRangeValidation.isValid) {
    return ageRangeValidation;
  }

  return { isValid: true };
};
