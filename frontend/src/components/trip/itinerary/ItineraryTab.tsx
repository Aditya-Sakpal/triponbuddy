import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { Itinerary, Activity } from "@/constants";
import { DayPlan } from "./DayPlan";
import { ActivityModificationModal, BuildYourOwnTripPanel, ApplyingChangesModal } from "@/components/trip";
import type { PendingChange } from "@/components/trip/BuildYourOwnTripPanel";
import { TripsApiService } from "@/lib/api-services";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

interface ItineraryTabProps {
  itinerary: Itinerary;
  tripId: string;
  onRefresh?: () => void;
}

export const ItineraryTab = ({ itinerary, tripId, onRefresh }: ItineraryTabProps) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activityImages, setActivityImages] = useState<{ [query: string]: string | undefined }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<{
    activity: Activity;
    day: number;
    index: number;
  } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const queries = Array.from(new Set(
          itinerary.daily_plans?.flatMap(day => day.activities.map(act => act.image_search_query)) || []
        ));
        if (queries.length === 0) return;
        
        const results: { [query: string]: string | undefined } = {};
        await Promise.all(
          queries.map(async (query) => {
            try {
              const res = await apiClient.post<{ success: boolean; images: { url: string }[] }>(
                "/api/images/single",
                {},
                { location: query, max_images: 1, min_width: 300, min_height: 200 }
              );
              results[query] = res.images?.[0]?.url;
            } catch (err: unknown) {
              results[query] = undefined;
            }
          })
        );
        setActivityImages(results);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [itinerary]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(prev => prev === dayNumber ? null : dayNumber);
  };

  const handleModifyActivity = (day: number, index: number, activity: Activity) => {
    setSelectedActivity({ activity, day, index });
  };

  const handleRemoveActivity = () => {
    if (!selectedActivity) return;
    
    setPendingChanges(prev => [
      ...prev,
      {
        type: "remove",
        day: selectedActivity.day,
        activityIndex: selectedActivity.index,
        activityName: selectedActivity.activity.activity,
      }
    ]);
    setSelectedActivity(null);
  };

  const handleSwitchActivity = (newActivity: Activity) => {
    if (!selectedActivity) return;
    
    setPendingChanges(prev => [
      ...prev,
      {
        type: "replace",
        day: selectedActivity.day,
        activityIndex: selectedActivity.index,
        activityName: selectedActivity.activity.activity,
        newActivity,
      }
    ]);
    setSelectedActivity(null);
  };

  const handleClearChanges = () => {
    setPendingChanges([]);
  };

  const handleApplyChanges = async () => {
    if (!user || pendingChanges.length === 0) return;
    
    setIsApplyingChanges(true);
    try {
      // Apply all changes sequentially
      for (const change of pendingChanges) {
        if (change.type === "remove") {
          await TripsApiService.removeActivity(
            tripId,
            change.day,
            change.activityIndex,
            user.id
          );
        } else if (change.type === "replace" && change.newActivity) {
          // Pass the complete activity object (already generated from alternatives)
          await TripsApiService.replaceActivity(
            tripId,
            change.day,
            change.activityIndex,
            change.newActivity, // Pass the entire activity object, not just the name
            user.id
          );
        }
      }
      
      // Clear pending changes
      setPendingChanges([]);
      
      // Turn off edit mode
      setIsEditMode(false);
      
      // Refresh the trip data instead of reloading the page
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Failed to apply changes:", error);
      alert("Failed to apply some changes. Please try again.");
    } finally {
      setIsApplyingChanges(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Build Your Own Trip Panel */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Build Your Own Trip</CardTitle>
                <CardDescription className="text-sm">
                  Customize your itinerary by removing or switching activities
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
              <Label htmlFor="edit-mode" className="cursor-pointer font-semibold text-blue-700">
                {isEditMode ? "Editing" : "Enable"}
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {pendingChanges.length > 0 && (
        <BuildYourOwnTripPanel
          pendingChanges={pendingChanges}
          onClearChanges={handleClearChanges}
          onApplyChanges={handleApplyChanges}
          isApplying={isApplyingChanges}
        />
      )}

      {/* Itinerary Card */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Your Complete Itinerary</CardTitle>
          <CardDescription>
            A detailed day-by-day breakdown of your {itinerary.duration_days}-day trip to {itinerary.destination}
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      <div className="space-y-4">
        {itinerary.daily_plans?.map((dayPlan) => (
          <DayPlan
            key={dayPlan.day}
            dayPlan={dayPlan}
            isExpanded={expandedDay === dayPlan.day}
            onToggle={() => toggleDay(dayPlan.day)}
            activityImages={activityImages}
            isEditMode={isEditMode}
            onModifyActivity={(index, activity) => handleModifyActivity(dayPlan.day, index, activity)}
          />
        ))}
      </div>

      {/* Activity Modification Modal */}
      {selectedActivity && (
        <ActivityModificationModal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          activity={selectedActivity.activity}
          tripId={tripId}
          day={selectedActivity.day}
          activityIndex={selectedActivity.index}
          onRemove={handleRemoveActivity}
          onSwitch={handleSwitchActivity}
        />
      )}

      {/* Applying Changes Modal */}
      <ApplyingChangesModal isOpen={isApplyingChanges} />
    </div>
  );
};
