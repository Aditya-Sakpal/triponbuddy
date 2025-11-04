/**
 * Post Validation Helper
 * Validation logic for post and comment content
 */

import { FORUM_CONSTANTS } from "@/constants/forum";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate post content
 */
export const validatePostContent = (content: string): ValidationResult => {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Please write something before posting.",
    };
  }

  if (trimmed.length > FORUM_CONSTANTS.POST_CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Post content must be less than ${FORUM_CONSTANTS.POST_CONTENT_MAX_LENGTH} characters.`,
    };
  }

  return { isValid: true };
};

/**
 * Validate comment content
 */
export const validateCommentContent = (content: string): ValidationResult => {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Please write something before commenting.",
    };
  }

  if (trimmed.length > FORUM_CONSTANTS.COMMENT_CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Comment must be less than ${FORUM_CONSTANTS.COMMENT_CONTENT_MAX_LENGTH} characters.`,
    };
  }

  return { isValid: true };
};

/**
 * Check if nesting depth is valid for replies
 */
export const canReply = (depth: number): boolean => {
  return depth < FORUM_CONSTANTS.MAX_NESTING_DEPTH;
};
