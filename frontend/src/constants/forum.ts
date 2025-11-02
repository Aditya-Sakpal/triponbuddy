/**
 * Forum Constants
 * Centralized constants for forum feature
 */

export const FORUM_CONSTANTS = {
  POST_CONTENT_MAX_LENGTH: 5000,
  COMMENT_CONTENT_MAX_LENGTH: 2000,
  MAX_NESTING_DEPTH: 3,
  POSTS_PER_PAGE: 20,
} as const;

export const FORUM_PLACEHOLDERS = {
  POST: "What's on your mind? Share your travel experiences...",
  COMMENT: "Write a comment...",
  IMAGE_URL: "Image URL",
} as const;

export const FORUM_MESSAGES = {
  SUCCESS: {
    POST_CREATED: "Your post has been published!",
    POST_DELETED: "Post deleted successfully",
    COMMENT_CREATED: "Comment posted successfully!",
    COMMENT_DELETED: "Comment deleted successfully",
  },
  ERROR: {
    POST_CREATE_FAILED: "Failed to create post. Please try again.",
    POST_DELETE_FAILED: "Failed to delete post",
    POST_LOAD_FAILED: "Failed to load posts",
    COMMENT_CREATE_FAILED: "Failed to post comment. Please try again.",
    COMMENT_DELETE_FAILED: "Failed to delete comment",
    COMMENT_LOAD_FAILED: "Failed to load comments",
    LIKE_FAILED: "Failed to update like",
    CONTENT_REQUIRED: "Please write something before posting.",
    COMMENT_CONTENT_REQUIRED: "Please write something before commenting.",
    SIGN_IN_REQUIRED: "Please sign in to like posts",
    SIGN_IN_REQUIRED_COMMENT: "Please sign in to like comments",
  },
  EMPTY_STATE: {
    NO_POSTS: "No posts yet. Be the first to share your travel story!",
    NO_COMMENTS: "No comments yet. Be the first to comment!",
    SIGN_IN_TO_COMMENT: "Please sign in to comment",
  },
} as const;
