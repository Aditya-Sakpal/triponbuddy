/**
 * Date Helper
 * Date formatting utilities for forum components
 */

import { formatDistanceToNow } from "date-fns";

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown time";
  }
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date: string | Date): string => {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
