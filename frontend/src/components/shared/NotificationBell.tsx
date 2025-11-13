/**
 * Notification Bell Component
 * Shows notification icon with unread count and dropdown panel
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { Bell, Check, X, UserPlus, CheckCircle, Shield } from "lucide-react";
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
import { EmergencyNumberModal } from "./EmergencyNumberModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const NotificationBell = () => {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [tripsWithEmergencyNumbers, setTripsWithEmergencyNumbers] = useState<Set<string>>(new Set());

  // Fetch user's trips to check emergency numbers
  const fetchTripsEmergencyStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips?user_id=${user.id}&page=1&limit=100`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.trips) {
          const tripsWithNumbers = new Set<string>();
          data.trips.forEach((trip: { emergency_contact_number?: string; is_joined?: boolean; original_trip_id?: string; trip_id: string }) => {
            if (trip.emergency_contact_number && trip.is_joined) {
              tripsWithNumbers.add(trip.original_trip_id || trip.trip_id);
            }
          });
          setTripsWithEmergencyNumbers(tripsWithNumbers);
        }
      }
    } catch (error) {
      console.error("Error fetching trips emergency status:", error);
    }
  }, [user]);

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
      fetchTripsEmergencyStatus();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchTripsEmergencyStatus();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, fetchNotifications, fetchTripsEmergencyStatus]);

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
    <>
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

                      {/* Setup Safety button for accepted join requests without emergency number */}
                      {notification.type === "join_accepted" && 
                       notification.related_trip_id && 
                       !tripsWithEmergencyNumbers.has(notification.related_trip_id) && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                              setShowEmergencyModal(true);
                              setIsOpen(false);
                            }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Setup Safety
                          </Button>
                        </div>
                      )}

                      {/* Show safety set confirmation for trips with emergency number */}
                      {notification.type === "join_accepted" && 
                       notification.related_trip_id && 
                       tripsWithEmergencyNumbers.has(notification.related_trip_id) && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            ✓ Safety Setup Complete
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

    {/* Emergency Number Setup Modal */}
    {selectedNotification && (
      <EmergencyNumberModal
        tripId={selectedNotification.related_trip_id || ""}
        tripTitle={selectedNotification.message.split("trip to ")[1]?.replace("has been accepted!", "") || "your trip"}
        isOpen={showEmergencyModal}
        onClose={() => {
          setShowEmergencyModal(false);
          setSelectedNotification(null);
        }}
        onSuccess={() => {
          fetchNotifications();
          fetchTripsEmergencyStatus();
        }}
      />
    )}
    </>
  );
};
