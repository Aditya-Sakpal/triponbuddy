import type { FeedbackType } from "@/lib/types";

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

export const validateFeedbackForm = (
  name: string,
  email: string,
  feedback: string,
  rating: number,
  isAuthenticated: boolean
): string | null => {
  if (!name.trim() || !email.trim() || !feedback.trim() || rating === 0) {
    return FEEDBACK_VALIDATION_MESSAGES.MISSING_FIELDS;
  }

  if (!isAuthenticated) {
    return FEEDBACK_VALIDATION_MESSAGES.NOT_AUTHENTICATED;
  }

  return null;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createFeedbackData = (
  formData: { name: string; email: string; feedback: string; feedback_type: FeedbackType },
  rating: number,
  pageUrl: string
) => ({
  name: formData.name.trim(),
  email: formData.email.trim(),
  feedback_type: formData.feedback_type,
  rating,
  feedback: formData.feedback.trim(),
  page_url: pageUrl,
});
