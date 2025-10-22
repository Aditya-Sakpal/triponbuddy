import { DayPlan } from "../DayPlan";
import type { DailyPlan, Activity } from "@/constants";
import type { SwitchingActivityState, ImageMap } from "../types";

interface DayPlanListProps {
  dailyPlans: DailyPlan[];
  expandedDay: number | null;
  onToggleDay: (dayNumber: number) => void;
  activityImages: ImageMap;
  isEditMode: boolean;
  onModifyActivity: (index: number, activity: Activity) => void;
  switchingActivity: SwitchingActivityState | null;
  alternativeImages: ImageMap;
  onSelectAlternative: (newActivity: Activity | null) => void;
  onCancelSwitch: () => void;
}

export const DayPlanList = ({
  dailyPlans,
  expandedDay,
  onToggleDay,
  activityImages,
  isEditMode,
  onModifyActivity,
  switchingActivity,
  alternativeImages,
  onSelectAlternative,
  onCancelSwitch,
}: DayPlanListProps) => {
  return (
    <div className="space-y-4">
      {dailyPlans?.map((dayPlan) => (
        <DayPlan
          key={dayPlan.day}
          dayPlan={dayPlan}
          isExpanded={expandedDay === dayPlan.day}
          onToggle={() => onToggleDay(dayPlan.day)}
          activityImages={activityImages}
          isEditMode={isEditMode}
          onModifyActivity={onModifyActivity}
          switchingActivity={
            switchingActivity?.day === dayPlan.day ? switchingActivity : null
          }
          alternativeImages={alternativeImages}
          onSelectAlternative={onSelectAlternative}
          onCancelSwitch={onCancelSwitch}
        />
      ))}
    </div>
  );
};
