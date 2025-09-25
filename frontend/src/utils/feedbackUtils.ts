import type { FeedbackType } from "@/constants";
import { FEEDBACK_TYPES, RATING_STARS, FEEDBACK_VALIDATION_MESSAGES } from "@/constants";

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
