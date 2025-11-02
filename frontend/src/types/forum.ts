/**
 * Forum/Social Feed TypeScript types
 */

export interface PostImage {
  url: string;
  alt?: string;
}

export interface SharedTrip {
  trip_id: string;
  destination: string;
  total_cost: string;
  cover_image_url?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
}

export interface Post {
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  images?: PostImage[];
  shared_trip?: SharedTrip;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  is_liked_by_user: boolean;
}

export interface CreatePostRequest {
  content: string;
  images?: PostImage[];
  shared_trip?: SharedTrip;
}

export interface Comment {
  comment_id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  parent_comment_id?: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  is_liked_by_user: boolean;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: string;
}

export interface PostFeedResponse {
  success: boolean;
  posts: Post[];
  page: number;
  page_size: number;
  total_posts: number;
  has_more: boolean;
}

export interface CommentsResponse {
  success: boolean;
  comments: Comment[];
  total_comments: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface LikeToggleData {
  is_liked: boolean;
}
