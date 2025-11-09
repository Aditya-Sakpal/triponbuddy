/**
 * Notification Bell Component
 * Shows notification icon with unread count and dropdown panel
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { Bell, Check, X, UserPlus, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/constants";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const NotificationBell = () => {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/join-requests/notifications?user_id=${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unread_count);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark all as read when panel opens
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) return;

    try {
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(
            `${API_BASE_URL}/api/join-requests/notifications/${n.notification_id}/read?user_id=${user.id}`,
            { method: "POST" }
          )
        )
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [user, notifications]);

  // Fetch on mount and periodically
  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, fetchNotifications]);

  // Track handled requests to hide buttons
  const [handledRequests, setHandledRequests] = useState<Set<string>>(new Set());

  // Handle join request action
  const handleJoinRequestAction = async (
    requestId: string,
    action: "accepted" | "rejected"
  ) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/join-requests/handle?user_id=${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: requestId,
            action: action,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: action === "accepted" ? "Request accepted" : "Request rejected",
          description: data.message,
        });

        // Mark this request as handled to hide buttons
        setHandledRequests((prev) => new Set(prev).add(requestId));

        // Refresh notifications
        fetchNotifications();
      } else {
        throw new Error(data.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error handling join request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
    }
  };

  // Mark all as read when panel opens
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      markAllAsRead();
    }
  }, [isOpen, notifications.length, markAllAsRead]);

  if (!isSignedIn) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.notification_id}>
                <div className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {notification.type === "join_request" ? (
                        <UserPlus className="h-5 w-5 text-blue-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>

                      {/* Action buttons for join requests */}
                      {notification.type === "join_request" &&
                        notification.related_request_id &&
                        notification.request_status === "pending" &&
                        !handledRequests.has(notification.related_request_id) && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinRequestAction(
                                  notification.related_request_id!,
                                  "accepted"
                                );
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinRequestAction(
                                  notification.related_request_id!,
                                  "rejected"
                                );
                              }}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      
                      {/* Show status for already handled requests */}
                      {notification.type === "join_request" &&
                        notification.request_status &&
                        notification.request_status !== "pending" && (
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              notification.request_status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {notification.request_status === "accepted" ? "Accepted" : "Rejected"}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <div className="border-b" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
