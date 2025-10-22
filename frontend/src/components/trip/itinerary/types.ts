import type { Activity } from "@/constants";

// Shared types
export interface SelectedActivity {
  activity: Activity;
  day: number;
  index: number;
}

export interface SwitchingActivityState {
  day: number;
  index: number;
  alternatives: Activity[];
  loading: boolean;
  selectedAlternative: Activity | null;
}

export interface ImageMap {
  [query: string]: string | undefined;
}

export interface PendingChange {
  type: "remove" | "replace";
  day: number;
  activityIndex: number;
  activityName: string;
  newActivityName?: string;
  newActivity?: Activity;
}

// DayPlan component types
export interface DayPlanProps {
  dayPlan: {
    day: number;
    date: string;
    theme: string;
    activities: Activity[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  activityImages: { [query: string]: string | undefined };
  isEditMode?: boolean;
  onModifyActivity?: (index: number, activity: Activity) => void;
  switchingActivity?: SwitchingActivityState | null;
  alternativeImages?: { [query: string]: string | undefined };
  onSelectAlternative?: (newActivity: Activity | null) => void;
  onConfirmSelection?: () => void;
  onCancelSwitch?: () => void;
}

export interface AlternativeSelectorProps {
  switchingActivity: SwitchingActivityState;
  alternativeImages?: { [query: string]: string | undefined };
  onSelectAlternative?: (newActivity: Activity | null) => void;
  onCancelSwitch?: () => void;
  hideTime?: boolean;
}

export interface AlternativePreviewProps {
  selectedAlternative: Activity;
}

export interface ActivityTimelineProps {
  activities: Activity[];
  activityImages: { [query: string]: string | undefined };
  isEditMode?: boolean;
  onModifyActivity?: (index: number, activity: Activity) => void;
  switchingActivity?: SwitchingActivityState | null;
  alternativeImages?: { [query: string]: string | undefined };
  onSelectAlternative?: (newActivity: Activity | null) => void;
  onCancelSwitch?: () => void;
}

export interface ActivityListProps {
  activities: Activity[];
  activityImages: { [query: string]: string | undefined };
  isEditMode?: boolean;
  onModifyActivity?: (index: number, activity: Activity) => void;
  switchingActivity?: SwitchingActivityState | null;
  alternativeImages?: { [query: string]: string | undefined };
  onSelectAlternative?: (newActivity: Activity | null) => void;
  onCancelSwitch?: () => void;
}
