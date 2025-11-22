/**
 * Custom hooks for Forum functionality
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { forumApi } from "@/services/forumApi";
import { Post, Comment, CreatePostRequest, CreateCommentRequest } from "@/types/forum";

/**
 * Hook for managing posts feed with pagination
 */
export const usePosts = (pageSize = 20) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const data = await forumApi.getPosts(pageNum, pageSize, user?.id);

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }

        setHasMore(data.has_more);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize, user?.id, toast]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const refresh = () => {
    setPage(1);
    fetchPosts(1);
  };

  const refreshPost = async (postId: string) => {
    try {
      const updatedPost = await forumApi.getPost(postId, user?.id);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.post_id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error refreshing post:", error);
    }
  };

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    refreshPost,
  };
};

/**
 * Hook for creating posts
 */
export const useCreatePost = (onSuccess?: () => void) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async (postData: CreatePostRequest) => {
    if (!user || !postData.content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await forumApi.createPost(
        postData,
        user.id,
        user.username || user.firstName || "Anonymous"
      );

      toast({
        title: "Success",
        description: "Your post has been published!",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createPost, isSubmitting };
};

/**
 * Hook for managing post actions (like, delete)
 */
export const usePostActions = (postId: string, onDelete?: () => void) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const deletePost = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      await forumApi.deletePost(postId, user.id);

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return null;
    }

    setIsLiking(true);

    try {
      const data = await forumApi.toggleLike(user.id, postId, "post");
      return data.data.is_liked;
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLiking(false);
    }
  };

  return { deletePost, toggleLike, isDeleting, isLiking };
};

/**
 * Hook for managing comments
 */
export const useComments = (postId: string) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await forumApi.getComments(postId, user?.id);
      setComments(data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, isLoading, error, refresh: fetchComments };
};

/**
 * Hook for creating comments
 */
export const useCreateComment = (postId: string, onSuccess?: () => void) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createComment = async (commentData: CreateCommentRequest) => {
    if (!user || !commentData.content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before commenting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await forumApi.createComment(
        postId,
        commentData,
        user.id,
        user.username || user.firstName || "Anonymous"
      );

      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createComment, isSubmitting };
};

/**
 * Hook for managing comment actions
 */
export const useCommentActions = (commentId: string, onDelete?: () => void) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const deleteComment = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      await forumApi.deleteComment(commentId, user.id);

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like comments",
        variant: "destructive",
      });
      return null;
    }

    setIsLiking(true);

    try {
      const data = await forumApi.toggleLike(user.id, commentId, "comment");
      return data.data.is_liked;
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLiking(false);
    }
  };

  return { deleteComment, toggleLike, isDeleting, isLiking };
};

/**
 * Hook for managing user's own posts
 */
export const useUserPosts = (userId: string, pageSize = 20) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const data = await forumApi.getUserPosts(userId, pageNum, pageSize);

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }

        setHasMore(data.has_more);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize, userId, toast]
  );

  useEffect(() => {
    if (userId) {
      fetchPosts(1);
    }
  }, [fetchPosts, userId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const refresh = () => {
    setPage(1);
    fetchPosts(1);
  };

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  };
};
