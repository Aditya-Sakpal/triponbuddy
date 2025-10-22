import { useState } from "react";
import type { Activity, Itinerary } from "@/constants";
import type { SelectedActivity, SwitchingActivityState, ImageMap, PendingChange } from "../types";
import { TripsApiService } from "@/lib/api-services";
import { fetchAlternativeImages } from "../helpers/imageHelpers";
import { removePendingChangeForActivity } from "../helpers/changeHelpers";

interface UseActivityModificationProps {
  tripId: string;
  userId: string | undefined;
  itinerary: Itinerary;
}

/**
 * Custom hook to manage activity modifications (remove, switch)
 */
export const useActivityModification = ({
  tripId,
  userId,
  itinerary,
}: UseActivityModificationProps) => {
  const [selectedActivity, setSelectedActivity] = useState<SelectedActivity | null>(null);
  const [switchingActivity, setSwitchingActivity] = useState<SwitchingActivityState | null>(null);
  const [alternativeImages, setAlternativeImages] = useState<ImageMap>({});

  const handleModifyActivity = (day: number, index: number, activity: Activity) => {
    setSelectedActivity({ activity, day, index });
  };

  const handleRemoveActivity = (
    setPendingChanges: React.Dispatch<React.SetStateAction<PendingChange[]>>
  ) => {
    if (!selectedActivity) return;

    setPendingChanges((prev) => [
      ...prev,
      {
        type: "remove",
        day: selectedActivity.day,
        activityIndex: selectedActivity.index,
        activityName: selectedActivity.activity.activity,
      },
    ]);
    setSelectedActivity(null);
  };

  const handleStartSwitch = async () => {
    if (!selectedActivity || !userId) return;

    const day = selectedActivity.day;
    const index = selectedActivity.index;
    setSelectedActivity(null);

    setSwitchingActivity({
      day,
      index,
      alternatives: [],
      loading: true,
      selectedAlternative: null,
    });

    try {
      const response = await TripsApiService.getActivityAlternatives(
        tripId,
        day,
        index,
        userId
      );

      if (response.success && response.alternatives) {
        const alts = response.alternatives as Activity[];
        setSwitchingActivity({
          day,
          index,
          alternatives: alts,
          loading: false,
          selectedAlternative: null,
        });

        // Fetch images for alternatives
        const images = await fetchAlternativeImages(alts);
        setAlternativeImages(images);
      } else {
        setSwitchingActivity(null);
        alert("Failed to generate alternatives. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      setSwitchingActivity(null);
      alert("Failed to generate alternatives. Please try again.");
    }
  };

  const handleSelectAlternative = (
    newActivity: Activity | null,
    setPendingChanges: React.Dispatch<React.SetStateAction<PendingChange[]>>
  ) => {
    if (!switchingActivity) return;

    // Update the switching activity to show the selected alternative
    setSwitchingActivity({
      ...switchingActivity,
      selectedAlternative: newActivity,
    });

    // Immediately add to pending changes if an alternative is selected
    if (newActivity) {
      // Remove any existing pending change for this activity
      setPendingChanges((prev) =>
        removePendingChangeForActivity(
          prev,
          switchingActivity.day,
          switchingActivity.index
        )
      );

      // Add the new replacement
      setPendingChanges((prev) => [
        ...prev,
        {
          type: "replace",
          day: switchingActivity.day,
          activityIndex: switchingActivity.index,
          activityName:
            itinerary.daily_plans[switchingActivity.day - 1].activities[
              switchingActivity.index
            ].activity,
          newActivity,
        },
      ]);
    } else {
      // If deselecting, remove from pending changes
      setPendingChanges((prev) =>
        removePendingChangeForActivity(
          prev,
          switchingActivity.day,
          switchingActivity.index,
          "replace"
        )
      );
    }
  };

  const handleCancelSwitch = (
    setPendingChanges: React.Dispatch<React.SetStateAction<PendingChange[]>>
  ) => {
    if (switchingActivity) {
      // Remove any pending changes for this activity when canceling
      setPendingChanges((prev) =>
        removePendingChangeForActivity(
          prev,
          switchingActivity.day,
          switchingActivity.index,
          "replace"
        )
      );
    }
    setSwitchingActivity(null);
    setAlternativeImages({});
  };

  const clearSwitchingState = () => {
    setSwitchingActivity(null);
    setAlternativeImages({});
  };

  return {
    selectedActivity,
    switchingActivity,
    alternativeImages,
    handleModifyActivity,
    handleRemoveActivity,
    handleStartSwitch,
    handleSelectAlternative,
    handleCancelSwitch,
    clearSwitchingState,
    setSelectedActivity,
  };
};
