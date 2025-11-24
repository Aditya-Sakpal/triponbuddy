import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface NotificationData {
  type: string;
  request_status: string;
  related_trip_id: string;
}

/**
 * Hook to fetch pending join requests count for a trip
 */
export const usePendingRequests = (
  showPendingRequests: boolean,
  userId: string | undefined,
  tripUserId: string,
  tripId: string
) => {
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      if (!showPendingRequests || !userId || tripUserId !== userId) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/join-requests/notifications?user_id=${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Count pending requests for this specific trip
            const count = data.notifications.filter(
              (notif: NotificationData) =>
                notif.type === "join_request" &&
                notif.request_status === "pending" &&
                notif.related_trip_id === tripId
            ).length;
            
            setPendingRequestsCount(count);
          }
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequestsCount();
  }, [showPendingRequests, userId, tripUserId, tripId]);

  const decrementPendingRequests = () => {
    setPendingRequestsCount((prev) => Math.max(0, prev - 1));
  };

  return { pendingRequestsCount, decrementPendingRequests };
};
