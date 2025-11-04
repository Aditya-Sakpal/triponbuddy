/**
 * Comment Thread Component
 * Displays all comments for a post with nested replies
 */

import { Loader2 } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { useComments } from "@/hooks/useForum";
import { FORUM_MESSAGES } from "@/constants/forum";

interface CommentThreadProps {
  postId: string;
  onCommentAdded?: () => void;
}

const CommentThread = ({ postId, onCommentAdded }: CommentThreadProps) => {
  const { comments, isLoading, error, refresh } = useComments(postId);

  const handleCommentCreated = () => {
    refresh();
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      )}

      {/* Comments List */}
      {!isLoading && !error && comments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {FORUM_MESSAGES.EMPTY_STATE.NO_COMMENTS}
        </div>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              postId={postId}
              onDelete={refresh}
              onReply={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
