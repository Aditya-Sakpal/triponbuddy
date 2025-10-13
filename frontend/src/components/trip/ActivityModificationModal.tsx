import { useState, useEffect } from "react";
import { X, Trash2, RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ActivityCard } from "./ActivityCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { TripsApiService } from "@/lib/api-services";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@clerk/clerk-react";
import type { Activity } from "@/constants";

interface ActivityModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  tripId: string;
  day: number;
  activityIndex: number;
  onRemove: () => void;
  onSwitch: (newActivity: Activity) => void;
}

export const ActivityModificationModal = ({
  isOpen,
  onClose,
  activity,
  tripId,
  day,
  activityIndex,
  onRemove,
  onSwitch,
}: ActivityModificationModalProps) => {
  const { user } = useUser();
  const [action, setAction] = useState<"remove" | "switch" | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<Activity | null>(null);
  const [alternatives, setAlternatives] = useState<Activity[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [alternativesError, setAlternativesError] = useState<string | null>(null);
  const [alternativeImages, setAlternativeImages] = useState<{ [query: string]: string | undefined }>({});

  // Fetch alternatives when user selects "switch"
  useEffect(() => {
    if (action === "switch" && alternatives.length === 0 && !isLoadingAlternatives) {
      fetchAlternatives();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  // Fetch images for alternatives
  useEffect(() => {
    if (alternatives.length > 0) {
      fetchAlternativeImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternatives]);

  const fetchAlternativeImages = async () => {
    try {
      const queries = alternatives.map(alt => alt.image_search_query);
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
      
      setAlternativeImages(results);
    } catch (error) {
      console.error("Error fetching alternative images:", error);
    }
  };

  const fetchAlternatives = async () => {
    if (!user) return;
    
    setIsLoadingAlternatives(true);
    setAlternativesError(null);
    
    try {
      const response = await TripsApiService.getActivityAlternatives(
        tripId,
        day,
        activityIndex,
        user.id
      );
      
      if (response.success && response.alternatives) {
        setAlternatives(response.alternatives as Activity[]);
      } else {
        setAlternativesError("Failed to generate alternatives");
      }
    } catch (error) {
      console.error("Error fetching alternatives:", error);
      setAlternativesError("Failed to generate alternatives. Please try again.");
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleApply = () => {
    if (action === "remove") {
      onRemove();
    } else if (action === "switch" && selectedAlternative) {
      onSwitch(selectedAlternative);
    }
    handleClose();
  };

  const handleClose = () => {
    setAction(null);
    setSelectedAlternative(null);
    setAlternatives([]);
    setAlternativeImages({});
    setAlternativesError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Activity</DialogTitle>
          <DialogDescription>
            What would you like to do with "{activity.activity}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Selection */}
          <div className="space-y-3">
            <Button
              variant={action === "remove" ? "default" : "outline"}
              className="w-full justify-start gap-2"
              onClick={() => {
                setAction("remove");
                setSelectedAlternative(null);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Remove Activity
            </Button>

            <Button
              variant={action === "switch" ? "default" : "outline"}
              className="w-full justify-start gap-2"
              onClick={() => setAction("switch")}
            >
              <RefreshCw className="w-4 h-4" />
              Switch Activity
            </Button>
          </div>

          {/* Alternatives Selection */}
          {action === "switch" && (
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">
                Choose an alternative:
              </Label>
              
              {isLoadingAlternatives && (
                <div className="py-4">
                  <LoadingState />
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Generating alternative activities...
                  </p>
                </div>
              )}
              
              {alternativesError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">{alternativesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAlternatives}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              {!isLoadingAlternatives && !alternativesError && alternatives.length > 0 && (
                <RadioGroup
                  value={selectedAlternative?.activity || ""}
                  onValueChange={(value) => {
                    const selected = alternatives.find(alt => alt.activity === value);
                    setSelectedAlternative(selected || null);
                  }}
                  className="space-y-4"
                >
                  {alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAlternative?.activity === alt.activity
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAlternative(alt)}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={alt.activity} id={`alt-${index}`} className="mt-6" />
                        <div className="flex-1">
                          <ActivityCard
                            activity={alt}
                            imageUrl={alternativeImages[alt.image_search_query]}
                            hideTime={true}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {!isLoadingAlternatives && !alternativesError && alternatives.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No alternatives available for this activity.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={
              !action || (action === "switch" && !selectedAlternative)
            }
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
