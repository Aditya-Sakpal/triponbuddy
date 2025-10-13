import { useState } from "react";
import { X, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Activity } from "@/constants";

export interface PendingChange {
  type: "remove" | "replace";
  day: number;
  activityIndex: number;
  activityName: string;
  newActivityName?: string;
  newActivity?: Activity;
}

interface BuildYourOwnTripPanelProps {
  pendingChanges: PendingChange[];
  onClearChanges: () => void;
  onApplyChanges: () => void;
  isApplying: boolean;
}

export const BuildYourOwnTripPanel = ({
  pendingChanges,
  onClearChanges,
  onApplyChanges,
  isApplying,
}: BuildYourOwnTripPanelProps) => {
  const removedActivities = pendingChanges.filter((c) => c.type === "remove");
  const replacedActivities = pendingChanges.filter((c) => c.type === "replace");

  if (pendingChanges.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pending Changes</CardTitle>
            <CardDescription>
              Review your customizations before applying
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {pendingChanges.length} {pendingChanges.length === 1 ? "change" : "changes"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Removed Activities */}
        {removedActivities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <Trash2 className="w-4 h-4" />
              <span>Activities to Remove ({removedActivities.length})</span>
            </div>
            <ul className="space-y-1 pl-6">
              {removedActivities.map((change, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • Day {change.day}: {change.activityName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Replaced Activities */}
        {replacedActivities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <RefreshCw className="w-4 h-4" />
              <span>Activities to Update ({replacedActivities.length})</span>
            </div>
            <ul className="space-y-1 pl-6">
              {replacedActivities.map((change, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • Day {change.day}: {change.activityName} → {change.newActivity?.activity || change.newActivityName || "New Activity"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            These changes will be applied to your itinerary. Replacements may take a few moments
            as new activities are generated.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearChanges}
            disabled={isApplying}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={onApplyChanges}
            disabled={isApplying}
            className="flex-1"
          >
            {isApplying ? "Applying..." : "Apply Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
