/**
 * Forum API Service
 * Centralized API calls for forum operations
 */

import { CreatePostRequest, CreateCommentRequest, PostFeedResponse, CommentsResponse, Post } from "@/types/forum";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const forumApi = {
  // Posts
  async getPosts(page: number, pageSize: number, userId?: string): Promise<PostFeedResponse> {
    const url = userId
      ? `${API_BASE_URL}/api/forum/posts?page=${page}&page_size=${pageSize}&user_id=${userId}`
      : `${API_BASE_URL}/api/forum/posts?page=${page}&page_size=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
  },

  async getPost(postId: string, userId?: string): Promise<Post> {
    const url = userId
      ? `${API_BASE_URL}/api/forum/posts/${postId}?user_id=${userId}`
      : `${API_BASE_URL}/api/forum/posts/${postId}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  },

  async createPost(postData: CreatePostRequest, userId: string, username: string): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/posts?user_id=${userId}&username=${username}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      }
    );
    if (!response.ok) throw new Error("Failed to create post");
    return response;
  },

  async deletePost(postId: string, userId: string): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/posts/${postId}?user_id=${userId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to delete post");
    return response;
  },

  async getUserPosts(userId: string, page: number, pageSize: number): Promise<PostFeedResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/users/${userId}/posts?page=${page}&page_size=${pageSize}`
    );
    if (!response.ok) throw new Error("Failed to fetch user posts");
    return response.json();
  },

  // Comments
  async getComments(postId: string, userId?: string): Promise<CommentsResponse> {
    const url = userId
      ? `${API_BASE_URL}/api/forum/posts/${postId}/comments?user_id=${userId}`
      : `${API_BASE_URL}/api/forum/posts/${postId}/comments`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch comments");
    return response.json();
  },

  async createComment(
    postId: string,
    commentData: CreateCommentRequest,
    userId: string,
    username: string
  ): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/posts/${postId}/comments?user_id=${userId}&username=${username}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      }
    );
    if (!response.ok) throw new Error("Failed to create comment");
    return response;
  },

  async deleteComment(commentId: string, userId: string): Promise<Response> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/comments/${commentId}?user_id=${userId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to delete comment");
    return response;
  },

  // Likes
  async toggleLike(userId: string, targetId: string, targetType: "post" | "comment"): Promise<{ data: { is_liked: boolean } }> {
    const response = await fetch(
      `${API_BASE_URL}/api/forum/like?user_id=${userId}&target_id=${targetId}&target_type=${targetType}`,
      { method: "POST" }
    );
    if (!response.ok) throw new Error("Failed to toggle like");
    return response.json();
  },
};
