/**
 * Join Requests Modal Component
 * Modal for trip owners to view and manage join requests
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, User } from "lucide-react";
import { JoinRequest } from "@/constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface JoinRequestsModalProps {
  tripId: string;
  tripTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRequestHandled?: () => void;
}

export const JoinRequestsModal = ({
  tripId,
  tripTitle,
  isOpen,
  onClose,
  onRequestHandled,
}: JoinRequestsModalProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending requests for this trip
  useEffect(() => {
    const fetchRequests = async () => {
      if (!isOpen || !user) return;

      setIsLoading(true);
      try {
        // Fetch all pending requests for user's trips
        const response = await fetch(
          `${API_BASE_URL}/api/join-requests/notifications?user_id=${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Filter notifications to get only pending join requests for this specific trip
            interface NotificationData {
              type: string;
              request_status: string;
              related_trip_id: string;
              related_request_id: string;
              requester_id: string;
              requester_name?: string;
              created_at: string;
            }

            const tripRequests = data.notifications.filter(
              (notif: NotificationData) =>
                notif.type === "join_request" &&
                notif.request_status === "pending" &&
                notif.related_trip_id === tripId
            );

            // Convert notifications to request format
            const formattedRequests: JoinRequest[] = tripRequests.map((notif: NotificationData) => ({
              request_id: notif.related_request_id,
              trip_id: notif.related_trip_id,
              trip_owner_id: user.id,
              requester_id: notif.requester_id,
              requester_name: notif.requester_name || "Anonymous",
              requester_age: 0, // Not available in notification
              requester_gender: "", // Not available in notification
              status: "pending" as const,
              trip_title: tripTitle,
              trip_destination: "",
              created_at: notif.created_at,
              updated_at: notif.created_at,
            }));

            setRequests(formattedRequests);
          }
        }
      } catch (error) {
        console.error("Error fetching join requests:", error);
        toast({
          title: "Error",
          description: "Failed to load join requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [isOpen, tripId, user, tripTitle, toast]);

  const handleRequest = async (requestId: string, action: "accepted" | "rejected") => {
    if (!user) return;

    setProcessingId(requestId);
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

        // Remove the request from the list
        setRequests((prev) => prev.filter((req) => req.request_id !== requestId));

        // Notify parent component
        if (onRequestHandled) {
          onRequestHandled();
        }
      } else {
        throw new Error(data.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error handling request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Requests</DialogTitle>
          <DialogDescription>
            Manage join requests for "{tripTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.request_id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div>
                  <p className="font-semibold">{request.requester_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested to join this trip
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleRequest(request.request_id, "accepted")}
                    disabled={processingId === request.request_id}
                    className="flex-1"
                  >
                    {processingId === request.request_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.request_id, "rejected")}
                    disabled={processingId === request.request_id}
                    className="flex-1"
                  >
                    {processingId === request.request_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
