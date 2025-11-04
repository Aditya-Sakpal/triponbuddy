/**
 * Forum utility helpers
 */

/**
 * Get username from Clerk user object
 */
export const getUserDisplayName = (user: {
  username?: string | null;
  firstName?: string | null;
}): string => {
  return user.username || user.firstName || "Anonymous";
};

/**
 * Get user initials for avatar fallback
 */
export const getUserInitials = (username: string): string => {
  return username.charAt(0).toUpperCase();
};

/**
 * Calculate indentation for nested comments
 */
export const getCommentIndentation = (depth: number): number => {
  return depth * 2;
};
