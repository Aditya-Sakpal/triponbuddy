import { useState } from "react";
import type { PendingChange } from "../types";
import { applyPendingChanges } from "../helpers/changeHelpers";

interface UsePendingChangesProps {
  tripId: string;
  userId: string | undefined;
  onRefresh?: () => void;
  onApplySuccess?: () => void;
}

/**
 * Custom hook to manage pending changes
 */
export const usePendingChanges = ({
  tripId,
  userId,
  onRefresh,
  onApplySuccess,
}: UsePendingChangesProps) => {
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const clearChanges = () => {
    setPendingChanges([]);
  };

  const applyChanges = async () => {
    if (!userId || pendingChanges.length === 0) return;

    setIsApplying(true);
    try {
      await applyPendingChanges(tripId, userId, pendingChanges);

      // Clear pending changes
      setPendingChanges([]);

      // Call success callback
      onApplySuccess?.();

      // Refresh the trip data
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Failed to apply changes:", error);
      alert("Failed to apply some changes. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  return {
    pendingChanges,
    setPendingChanges,
    isApplying,
    clearChanges,
    applyChanges,
  };
};
