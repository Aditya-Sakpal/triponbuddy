import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post } from "@/types/forum";
import ForumTripCard from "./ForumTripCard";
import CommentThread from "./CommentThread";
import { usePostActions } from "@/hooks/useForum";
import { useToast } from "@/hooks/use-toast";
import { getRelativeTime, sharePost } from "./helpers";
import {UserAvatar, DeleteConfirmationDialog, ImageGrid, ActionStats } from "./ui";


interface PostCardProps {
  post: Post;
  onDelete?: () => void;
  onLike?: (postId: string, isLiked: boolean) => void;
  onCommentClick?: (postId: string) => void;
  onCommentAdded?: (postId: string) => void;
  initialShowComments?: boolean;
}

const PostCard = ({ 
  post, 
  onDelete, 
  onLike, 
  onCommentClick, 
  onCommentAdded,
  initialShowComments = false 
}: PostCardProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showComments, setShowComments] = useState(initialShowComments);

  const { deletePost, toggleLike, isDeleting, isLiking } = usePostActions(
    post.post_id,
    () => {
      setShowDeleteDialog(false);
      onDelete?.();
    }
  );

  useEffect(() => {
    setCommentsCount(post.comments_count);
  }, [post.comments_count]);

  useEffect(() => {
    setShowComments(initialShowComments);
  }, [initialShowComments]);

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id) return;
    await deletePost();
  };

  const handleLike = async () => {
    const newIsLiked = await toggleLike();
    if (newIsLiked !== null) {
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
      if (onLike) onLike(post.post_id, newIsLiked);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (onCommentClick) onCommentClick(post.post_id);
  };

  const handleCommentAdded = () => {
    setCommentsCount((prev) => prev + 1);
    if (onCommentAdded) onCommentAdded(post.post_id);
  };

  const handleShare = async () => {
    await sharePost(
      post.post_id,
      `Post by ${post.username}`,
      post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
      () => {
        toast({
          title: "Link copied!",
          description: "Post link has been copied to your clipboard.",
        });
      },
      (url) => {
        toast({
          title: "Copy this link",
          description: url,
          duration: 10000,
        });
      }
    );
  };

  const timeAgo = getRelativeTime(post.created_at);
  const isOwner = user && user.id === post.user_id;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar username={post.username} />
            <div>
              <p className="font-semibold">{post.username}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          {isOwner && (
            <DeleteConfirmationDialog
              title="Delete Post"
              description="Are you sure you want to delete this post? This action cannot be undone."
              onConfirm={handleDelete}
              isDeleting={isDeleting}
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <p className="whitespace-pre-wrap break-words">{post.content}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <ImageGrid images={post.images} />
        )}

        {/* Shared Trip */}
        {post.shared_trip && (
          <ForumTripCard trip={post.shared_trip} username={post.username} />
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch border-t pt-4">
        <ActionStats
          likesCount={likesCount}
          isLiked={isLiked}
          onLike={handleLike}
          isLiking={isLiking}
          commentsCount={commentsCount}
          onCommentClick={handleCommentClick}
          onShare={handleShare}
        />

        {/* Comments Section - Twitter-style inline display */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentThread
              postId={post.post_id}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
