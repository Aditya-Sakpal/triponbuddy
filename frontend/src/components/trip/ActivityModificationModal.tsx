import { Trash2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/constants";

interface ActivityModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  tripId: string;
  day: number;
  activityIndex: number;
  onRemove: () => void;
  onSwitch: () => void;
}

export const ActivityModificationModal = ({
  isOpen,
  onClose,
  activity,
  onRemove,
  onSwitch,
}: ActivityModificationModalProps) => {
  const handleRemove = () => {
    onRemove();
    onClose();
  };

  const handleSwitch = () => {
    onSwitch();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[90]">
        <DialogHeader>
          <DialogTitle>Modify Activity</DialogTitle>
          <DialogDescription>
            What would you like to do with "{activity.activity}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 h-12 text-base"
            onClick={handleRemove}
          >
            <Trash2 className="w-5 h-5" />
            Remove Activity
          </Button>

          <Button
            variant="default"
            className="w-full justify-start gap-3 h-12 text-base"
            onClick={handleSwitch}
          >
            <RefreshCw className="w-5 h-5" />
            Switch Activity
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
