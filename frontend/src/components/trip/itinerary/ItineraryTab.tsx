import { useState } from "react";
import type { Itinerary } from "@/constants";
import { ActivityModificationModal, BuildYourOwnTripPanel, ApplyingChangesModal } from "@/components/trip";
import { useUser } from "@clerk/clerk-react";
import { EditModeHeader } from "./components/EditModeHeader";
import { ItineraryHeader } from "./components/ItineraryHeader";
import { DayPlanList } from "./components/DayPlanList";
import { RoadPlacesNotification } from "./RoadPlacesNotification";
import { useItineraryImages } from "./hooks/useItineraryImages";
import { useActivityModification } from "./hooks/useActivityModification";
import { usePendingChanges } from "./hooks/usePendingChanges";
import { useEditMode } from "./hooks/useEditMode";

interface ItineraryTabProps {
  itinerary: Itinerary;
  tripId: string;
  onRefresh?: () => void;
  transportationMode?: string;
  onNavigateToTransportation?: () => void;
  isOwner: boolean;
  isJoinee: boolean;
}

export const ItineraryTab = ({ itinerary, tripId, onRefresh, transportationMode = 'default', onNavigateToTransportation, isOwner, isJoinee }: ItineraryTabProps) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const { user } = useUser();
  
  const isRoadMode = transportationMode === 'road';

  // Debug logging for RoadPlacesNotification visibility
  console.log('[ItineraryTab] RoadPlacesNotification debug:', {
    isOwner,
    isJoinee,
    isRoadMode,
    transportationMode,
    hasOnNavigateToTransportation: !!onNavigateToTransportation,
    shouldShow: (isOwner || isJoinee) && isRoadMode && !!onNavigateToTransportation
  });

  // Custom hooks
  const { activityImages, loading, error } = useItineraryImages(itinerary);

  const {
    pendingChanges,
    setPendingChanges,
    isApplying: isApplyingChanges,
    clearChanges,
    applyChanges,
  } = usePendingChanges({
    tripId,
    userId: user?.id,
    onRefresh,
    onApplySuccess: () => {
      activityModification.clearSwitchingState();
      editMode.setIsEditMode(false);
    },
  });

  const activityModification = useActivityModification({
    tripId,
    userId: user?.id,
    itinerary,
  });

  const editMode = useEditMode({
    onDisable: () => {
      activityModification.clearSwitchingState();
      setPendingChanges([]);
    },
  });

  // UI handlers
  const toggleDay = (dayNumber: number) => {
    setExpandedDay((prev) => (prev === dayNumber ? null : dayNumber));
  };

  return (
    <div className="space-y-6">
      {/* Build Your Own Trip Panel - Only shown to owners */}
      {isOwner && (
        <EditModeHeader
          isEditMode={editMode.isEditMode}
          onToggle={editMode.setIsEditMode}
        />
      )}

      {isOwner && pendingChanges.length > 0 && (
        <BuildYourOwnTripPanel
          pendingChanges={pendingChanges}
          onClearChanges={clearChanges}
          onApplyChanges={applyChanges}
          isApplying={isApplyingChanges}
        />
      )}

      {/* Itinerary Header */}
      <ItineraryHeader
        destination={itinerary.destination}
        durationDays={itinerary.duration_days}
      />

      {/* Road Places Notification - Only shown in Road mode to owners and joinees */}
      {(isOwner || isJoinee) && isRoadMode && onNavigateToTransportation && (
        <RoadPlacesNotification tripId={tripId} onNavigateToTransportation={onNavigateToTransportation} />
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      {/* Day Plans */}
      <DayPlanList
        dailyPlans={itinerary.daily_plans || []}
        expandedDay={expandedDay}
        onToggleDay={toggleDay}
        activityImages={activityImages}
        isEditMode={editMode.isEditMode}
        onModifyActivity={(index, activity) =>
          activityModification.handleModifyActivity(expandedDay || 1, index, activity)
        }
        switchingActivity={activityModification.switchingActivity}
        alternativeImages={activityModification.alternativeImages}
        onSelectAlternative={(activity) =>
          activityModification.handleSelectAlternative(activity, setPendingChanges)
        }
        onCancelSwitch={() => activityModification.handleCancelSwitch(setPendingChanges)}
      />

      {/* Activity Modification Modal */}
      {activityModification.selectedActivity && (
        <ActivityModificationModal
          isOpen={!!activityModification.selectedActivity}
          onClose={() => activityModification.setSelectedActivity(null)}
          activity={activityModification.selectedActivity.activity}
          tripId={tripId}
          day={activityModification.selectedActivity.day}
          activityIndex={activityModification.selectedActivity.index}
          onRemove={() => activityModification.handleRemoveActivity(setPendingChanges)}
          onSwitch={activityModification.handleStartSwitch}
        />
      )}

      {/* Applying Changes Modal */}
      <ApplyingChangesModal isOpen={isApplyingChanges} />
    </div>
  );
};
