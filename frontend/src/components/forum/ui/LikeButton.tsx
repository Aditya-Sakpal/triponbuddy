import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

export const LikeButton = ({
  isLiked,
  likesCount,
  onLike,
  disabled = false,
  size = "default",
}: LikeButtonProps) => {
  const sizeClasses = size === "sm" ? "h-7 px-2 gap-1" : "gap-2";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-5 w-5";
  const textSize = size === "sm" ? "text-xs" : "font-medium";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onLike}
      disabled={disabled}
      className={sizeClasses}
    >
      <Heart
        className={`${iconSize} ${
          isLiked ? "fill-red-500 text-red-500" : ""
        }`}
      />
      <span className={textSize}>{likesCount}</span>
    </Button>
  );
};

