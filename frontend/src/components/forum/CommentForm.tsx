/**
 * Comment Form Component
 * Form for creating new comments or replies
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useCreateComment } from "@/hooks/useForum";
import { FORUM_CONSTANTS, FORUM_PLACEHOLDERS, FORUM_MESSAGES } from "@/constants/forum";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCommentCreated?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

const CommentForm = ({
  postId,
  parentCommentId,
  onCommentCreated,
  onCancel,
  placeholder = FORUM_PLACEHOLDERS.COMMENT,
}: CommentFormProps) => {
  const { user } = useUser();
  const [content, setContent] = useState("");

  const { createComment, isSubmitting } = useCreateComment(postId, () => {
    setContent("");
    onCommentCreated?.();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComment({
      content: content.trim(),
      parent_comment_id: parentCommentId,
    });
  };

  if (!user) {
    return (
      <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground text-center">
        {FORUM_MESSAGES.EMPTY_STATE.SIGN_IN_TO_COMMENT}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-2">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={FORUM_CONSTANTS.COMMENT_CONTENT_MAX_LENGTH}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {content.length}/{FORUM_CONSTANTS.COMMENT_CONTENT_MAX_LENGTH}
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
