import { Button } from "@/components/ui/button";
import { MessageCircle, Share2 } from "lucide-react";
import { LikeButton } from "./LikeButton";

interface ActionStatsProps {
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
  isLiking: boolean;
  commentsCount?: number;
  onCommentClick?: () => void;
  onShare?: () => void;
  showComments?: boolean;
  showShare?: boolean;
}

export const ActionStats = ({
  likesCount,
  isLiked,
  onLike,
  isLiking,
  commentsCount,
  onCommentClick,
  onShare,
  showComments = true,
  showShare = true,
}: ActionStatsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Like Button */}
      <LikeButton
        isLiked={isLiked}
        likesCount={likesCount}
        onLike={onLike}
        disabled={isLiking}
      />

      {/* Comment Button */}
      {showComments && onCommentClick !== undefined && commentsCount !== undefined && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{commentsCount}</span>
        </Button>
      )}

      {/* Share Button */}
      {showShare && onShare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="gap-2"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

