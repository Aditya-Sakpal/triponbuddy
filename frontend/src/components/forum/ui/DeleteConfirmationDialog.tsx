import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  isDeleting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerSize?: "icon" | "sm" | "default";
  triggerClassName?: string;
}

export const DeleteConfirmationDialog = ({
  title,
  description,
  onConfirm,
  isDeleting,
  open,
  onOpenChange,
  triggerSize = "icon",
  triggerClassName = "h-8 w-8 text-destructive hover:text-destructive",
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={triggerSize}
          className={triggerClassName}
        >
          <Trash2 className={triggerSize === "icon" ? "h-4 w-4" : "h-3 w-3"} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

