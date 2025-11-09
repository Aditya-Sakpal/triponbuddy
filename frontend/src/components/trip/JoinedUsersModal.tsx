import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface JoinedUser {
  user_id: string;
  full_name: string | null;
  username: string | null;
  image_url: string;
}

interface JoinedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
  tripTitle: string;
}

export const JoinedUsersModal = ({ 
  isOpen, 
  onClose, 
  userIds,
  tripTitle 
}: JoinedUsersModalProps) => {
  const [users, setUsers] = useState<JoinedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen || !userIds.length) {
        console.log("JoinedUsersModal: Skipping fetch", { isOpen, userIdsLength: userIds.length });
        return;
      }
      
      console.log("JoinedUsersModal: Fetching users", { userIds });
      setIsLoading(true);
      try {
        const response = await apiClient.post<{
          success: boolean;
          users: JoinedUser[];
        }>('/api/users/batch', { user_ids: userIds });
        
        console.log("JoinedUsersModal: API response", response);
        
        if (response.success && response.users) {
          console.log("JoinedUsersModal: Setting users", response.users);
          setUsers(response.users);
        } else {
          console.warn("JoinedUsersModal: Invalid response", response);
        }
      } catch (error) {
        console.error("JoinedUsersModal: Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userIds]);

  const getDisplayName = (user: JoinedUser) => {
    return user.full_name || user.username || "Anonymous User";
  };

  const getInitials = (user: JoinedUser) => {
    const name = getDisplayName(user);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Joined Users
          </DialogTitle>
          <DialogDescription>
            People who have joined {tripTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No users have joined this trip yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={user.image_url} alt={getDisplayName(user)} />
                    <AvatarFallback className="bg-bula text-white">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{getDisplayName(user)}</p>
                    {user.username && user.full_name && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
