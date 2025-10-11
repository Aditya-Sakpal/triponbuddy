import { useState } from "react";
import { X, Trash2, RefreshCw } from "lucide-react";
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
import type { Activity } from "@/constants";

interface ActivityModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  onRemove: () => void;
  onSwitch: (newActivityName: string) => void;
}

export const ActivityModificationModal = ({
  isOpen,
  onClose,
  activity,
  onRemove,
  onSwitch,
}: ActivityModificationModalProps) => {
  const [action, setAction] = useState<"remove" | "switch" | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string>("");

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
    setSelectedAlternative("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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
                setSelectedAlternative("");
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
              {activity.alternatives && activity.alternatives.length > 0 ? (
                <RadioGroup
                  value={selectedAlternative}
                  onValueChange={setSelectedAlternative}
                  className="space-y-2"
                >
                  {activity.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <RadioGroupItem value={alt} id={`alt-${index}`} />
                      <Label
                        htmlFor={`alt-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {alt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
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
