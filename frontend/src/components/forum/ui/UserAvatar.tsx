import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/components/forum/helpers";

interface UserAvatarProps {
  username: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const UserAvatar = ({ username, size = "default", className = "" }: UserAvatarProps) => {
 const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  };

 const textSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarFallback className={`bg-primary text-primary-foreground ${textSizeClasses[size]}`}>
        {getUserInitials(username)}
      </AvatarFallback>
    </Avatar>
  );
};

