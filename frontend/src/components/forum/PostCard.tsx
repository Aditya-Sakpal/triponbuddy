/**
 * Post Card Component
 * Displays a single post with likes, comments, and actions
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Post } from "@/types/forum";
import ForumTripCard from "./ForumTripCard";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePostActions } from "@/hooks/useForum";
import { getUserInitials } from "@/utils/forumHelpers";

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
  onLike?: (postId: string, isLiked: boolean) => void;
  onCommentClick?: (postId: string) => void;
  onCommentAdded?: (postId: string) => void;
}

const PostCard = ({ post, onDelete, onLike, onCommentClick }: PostCardProps) => {
  const { user } = useUser();
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(post.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.username}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          {user && user.id === post.user_id && (
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <p className="whitespace-pre-wrap break-words">{post.content}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.alt || `Post image ${index + 1}`}
                className="w-full h-64 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        {/* Shared Trip */}
        {post.shared_trip && (
          <ForumTripCard trip={post.shared_trip} username={post.username} />
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="gap-2"
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className="font-medium">{likesCount}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCommentClick && onCommentClick(post.post_id)}
            className="gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{commentsCount}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
