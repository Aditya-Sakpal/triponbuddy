import type { PendingChange } from "../types";
import { TripsApiService } from "@/lib/api-services";

/**
 * Sorts pending changes to avoid index conflicts
 * 1. Apply replacements first (indices stay the same)
 * 2. Apply removals in reverse order (highest index first)
 */
export const sortPendingChanges = (changes: PendingChange[]) => {
  const replaceChanges = changes.filter((c) => c.type === "replace");
  const removeChanges = changes
    .filter((c) => c.type === "remove")
    .sort((a, b) => {
      // Sort by day first, then by activity index in descending order
      if (a.day !== b.day) return a.day - b.day;
      return b.activityIndex - a.activityIndex;
    });

  return { replaceChanges, removeChanges };
};

/**
 * Applies all pending changes to the trip
 */
export const applyPendingChanges = async (
  tripId: string,
  userId: string,
  pendingChanges: PendingChange[]
): Promise<void> => {
  const { replaceChanges, removeChanges } = sortPendingChanges(pendingChanges);

  // Apply replacements first
  for (const change of replaceChanges) {
    if (change.newActivity) {
      await TripsApiService.replaceActivity(
        tripId,
        change.day,
        change.activityIndex,
        change.newActivity,
        userId
      );
    }
  }

  // Then apply removals in reverse order
  for (const change of removeChanges) {
    await TripsApiService.removeActivity(
      tripId,
      change.day,
      change.activityIndex,
      userId
    );
  }
};

/**
 * Removes a pending change for a specific activity
 */
export const removePendingChangeForActivity = (
  changes: PendingChange[],
  day: number,
  activityIndex: number,
  type?: "remove" | "replace"
): PendingChange[] => {
  return changes.filter((change) => {
    if (change.day !== day || change.activityIndex !== activityIndex) {
      return true;
    }
    if (type && change.type !== type) {
      return true;
    }
    return false;
  });
};
