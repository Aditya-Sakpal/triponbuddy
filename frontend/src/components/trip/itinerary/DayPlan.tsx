import { Card, CardContent } from "@/components/ui/card";
import { DayPlanHeader } from "./DayPlanHeader";
import { ActivityTimeline } from "./ActivityTimeline";
import { ActivityList } from "./ActivityList";
import type { DayPlanProps } from "./types";

export const DayPlan = ({
  dayPlan,
  isExpanded,
  onToggle,
  activityImages,
  isEditMode = false,
  onModifyActivity,
  switchingActivity,
  alternativeImages,
  onSelectAlternative,
  onCancelSwitch
}: DayPlanProps) => {
  return (
    <Card className="mb-6">
      <DayPlanHeader
        day={dayPlan.day}
        theme={dayPlan.theme}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      {isExpanded && (
        <CardContent className="py-4">
          {/* Mobile View - Stacked Layout */}
          <ActivityList
            activities={dayPlan.activities}
            activityImages={activityImages}
            isEditMode={isEditMode}
            onModifyActivity={onModifyActivity}
            switchingActivity={switchingActivity}
            alternativeImages={alternativeImages}
            onSelectAlternative={onSelectAlternative}
            onCancelSwitch={onCancelSwitch}
          />

          {/* Desktop View - Timeline Layout */}
          <ActivityTimeline
            activities={dayPlan.activities}
            activityImages={activityImages}
            isEditMode={isEditMode}
            onModifyActivity={onModifyActivity}
            switchingActivity={switchingActivity}
            alternativeImages={alternativeImages}
            onSelectAlternative={onSelectAlternative}
            onCancelSwitch={onCancelSwitch}
          />
        </CardContent>
      )}
    </Card>
  );
};