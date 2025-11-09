/**
 * post Trip to Community Dialog
 * Allows users to post their trips to the forum
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Share2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TripDB } from "@/constants";
import { SharedTrip } from "@/types/forum";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getCalculatedBudget } from "@/utils/tripUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface PostTripDialogProps {
  trip: TripDB;
  children: React.ReactNode;
}

export const PostTripDialog = ({ trip, children }: PostTripDialogProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post trips",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please add a message to your post",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, make the trip public if it isn't already
      if (!trip.is_public) {
        const updateResponse = await fetch(
          `${API_BASE_URL}/api/trips/${trip.trip_id}?user_id=${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_public: true }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update trip visibility");
        }
      }

      // Prepare shared trip data
      const sharedTripData: SharedTrip = {
        trip_id: trip.trip_id,
        destination: trip.destination,
        total_cost: getCalculatedBudget(trip),
        cover_image_url: trip.destination_image,
        start_date: trip.start_date,
        end_date: trip.end_date || trip.start_date,
        duration_days: trip.duration_days,
      };

      // Create forum post
      const postResponse = await fetch(
        `${API_BASE_URL}/api/forum/posts?user_id=${user.id}&username=${
          user.username || user.firstName || "Anonymous"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
            shared_trip: sharedTripData,
          }),
        }
      );

      if (!postResponse.ok) {
        throw new Error("Failed to create post");
      }

      toast({
        title: "Success!",
        description: "Your trip has been shared with the community",
      });

      setOpen(false);
      setContent("");

      // Navigate to forum to see the post
      navigate("/forum");
    } catch (error) {
      console.error("Error sharing trip:", error);
      toast({
        title: "Error",
        description: "Failed to post trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Post Trip to Community</DialogTitle>
          <DialogDescription>
            Post your {trip.destination} trip with the TripOnBuddy community!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trip Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2">
            <h4 className="font-semibold text-primary">
              {user?.username || user?.firstName || "Your"}'s trip to{" "}
              {trip.destination}
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📅 {trip.duration_days} days</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="flex items-center gap-1 cursor-help">
                      💰 {getCalculatedBudget(trip)}
                      <Info className="h-3 w-3" />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Sum of estimated activity costs. Actual costs may be higher.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <Label htmlFor="post-content">Add a message</Label>
            <Textarea
              id="post-content"
              placeholder="Tell the community about your trip experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: This will make your trip visible to all community members.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Post to Community
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
