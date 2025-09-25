import type { FeedbackType } from './types';

// Feedback-related constants
export const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: "general", label: "General" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

export const RATING_STARS = [1, 2, 3, 4, 5];

export const FEEDBACK_VALIDATION_MESSAGES = {
  MISSING_FIELDS: "Please fill in all required fields and provide a rating.",
  NOT_AUTHENTICATED: "Please log in to submit feedback.",
  SUBMIT_SUCCESS: "Feedback submitted successfully!",
  SUBMIT_ERROR: "Failed to submit feedback. Please try again.",
} as const;