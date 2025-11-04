import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import { Comment } from "@/types/forum";
import CommentForm from "./CommentForm";
import { useCommentActions } from "@/hooks/useForum";
import { getRelativeTime, canReply, getCommentIndentation } from "./helpers";
import {UserAvatar, DeleteConfirmationDialog, LikeButton} from "./ui";


interface CommentItemProps {
  comment: Comment;
  postId: string;
  onDelete?: () => void;
  onReply?: () => void;
  depth?: number;
}

const CommentItem = ({ comment, postId, onDelete, onReply, depth = 0 }: CommentItemProps) => {
  const { user } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [isLiked, setIsLiked] = useState(comment.is_liked_by_user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { deleteComment, toggleLike, isDeleting, isLiking } = useCommentActions(
    comment.comment_id,
    () => {
      setShowDeleteDialog(false);
      onDelete?.();
    }
  );

  const handleDelete = async () => {
    if (!user || user.id !== comment.user_id) return;
    await deleteComment();
  };

  const handleLike = async () => {
    const newIsLiked = await toggleLike();
    if (newIsLiked !== null) {
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (onReply) onReply();
  };

  const timeAgo = getRelativeTime(comment.created_at);
  const marginLeft = getCommentIndentation(depth);
  const isOwner = user && user.id === comment.user_id;
  const canAddReply = canReply(depth);

  return (
    <div className={`space-y-2 ${depth > 0 ? `ml-${marginLeft} border-l-2 border-muted pl-4` : ""}`}>
      <div className="flex items-start gap-3">
        <UserAvatar username={comment.username} size="sm" />

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {isOwner && (
              <DeleteConfirmationDialog
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                triggerSize="sm"
                triggerClassName="h-6 w-6 text-destructive hover:text-destructive ml-auto"
              />
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>

          <div className="flex items-center gap-2">
            <LikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={handleLike}
              disabled={isLiking}
              size="sm"
            />

            {canAddReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-7 px-2 gap-1"
              >
                <Reply className="h-3 w-3" />
                <span className="text-xs">Reply</span>
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <CommentForm
              postId={postId}
              parentCommentId={comment.comment_id}
              onCommentCreated={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
            />
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2 mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.comment_id}
                  comment={reply}
                  postId={postId}
                  onDelete={onReply}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;