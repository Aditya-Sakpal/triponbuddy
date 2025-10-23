import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/trip";
import { AlternativeSelector } from "./AlternativeSelector";
import type { ActivityTimelineProps } from "./types";

export const ActivityTimeline = ({
  activities,
  activityImages,
  isEditMode = false,
  onModifyActivity,
  switchingActivity,
  alternativeImages,
  onSelectAlternative,
  onCancelSwitch
}: ActivityTimelineProps) => {
  return (
    <div className="hidden md:block">
      {activities.map((activity, index) => {
        const isLastActivity = index === activities.length - 1;
        const showingAlternatives = switchingActivity && switchingActivity.index === index;
        
        return (
          <div key={index} className="relative flex gap-6">
            {/* Timeline Badge and Connector */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: '140px' }}>
              <Badge className="bg-bula hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium whitespace-nowrap">
                {activity.time}
              </Badge>
              {!isLastActivity && !showingAlternatives && (
                <div className="w-0.5 bg-gray-400 flex-grow mt-2" style={{ minHeight: '100px' }} />
              )}
            </div>

            {/* Activity Card */}
            <div className="flex-grow pb-8">
              <ActivityCard
                activity={activity}
                imageUrl={activityImages[activity.image_search_query]}
                hideTime={true}
                isEditMode={isEditMode}
                onModify={() => onModifyActivity?.(index, activity)}
              />
              {isEditMode && showingAlternatives && (
                <AlternativeSelector
                  switchingActivity={switchingActivity}
                  alternativeImages={alternativeImages}
                  onSelectAlternative={onSelectAlternative}
                  onCancelSwitch={onCancelSwitch}
                  hideTime={true}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
