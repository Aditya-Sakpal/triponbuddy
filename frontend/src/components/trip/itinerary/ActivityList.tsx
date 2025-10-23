import { ActivityCard } from "@/components/trip";
import { AlternativeSelector } from "./AlternativeSelector";
import type { ActivityListProps } from "./types";

export const ActivityList = ({
  activities,
  activityImages,
  isEditMode = false,
  onModifyActivity,
  switchingActivity,
  alternativeImages,
  onSelectAlternative,
  onCancelSwitch
}: ActivityListProps) => {
  return (
    <div className="md:hidden space-y-4">
      {activities.map((activity, index) => (
        <div key={index}>
          <ActivityCard
            activity={activity}
            imageUrl={activityImages[activity.image_search_query]}
            isEditMode={isEditMode}
            onModify={() => onModifyActivity?.(index, activity)}
          />
          {isEditMode && switchingActivity && switchingActivity.index === index && (
            <AlternativeSelector
              switchingActivity={switchingActivity}
              alternativeImages={alternativeImages}
              onSelectAlternative={onSelectAlternative}
              onCancelSwitch={onCancelSwitch}
              hideTime={false}
            />
          )}
        </div>
      ))}
    </div>
  );
};
