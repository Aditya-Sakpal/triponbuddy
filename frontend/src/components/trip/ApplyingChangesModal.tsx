import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import tripBuddyLogo from "@/assets/triponbuddylogo.png";

interface ApplyingChangesModalProps {
  isOpen: boolean;
}

export const ApplyingChangesModal = ({ isOpen }: ApplyingChangesModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Bouncing Animation Container */}
          <div className="animate-bounce-slow flex flex-col items-center space-y-4">
            {/* Floating Logo Animation with Spinning Lines */}
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Spinning circular lines around the logo - 3 separate arcs */}
              <svg className="absolute inset-0 w-24 h-24 animate-spin-slow" viewBox="0 0 80 80">
                {/* Dark Blue Arc */}
                <path
                  d="M 40 10 A 30 30 0 0 1 70 40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Light Blue Arc */}
                <path
                  d="M 70 40 A 30 30 0 0 1 40 70"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                {/* Pink Arc */}
                <path
                  d="M 40 70 A 30 30 0 0 1 10 40"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>

              <div className="relative z-10">
                <img
                  src={tripBuddyLogo}
                  alt="TripOnBuddy"
                  className="w-16 h-16 object-contain drop-shadow-lg"
                />
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Applying Changes</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we update your itinerary...
            </p>
          </div>

          {/* Progress indicator */}
          <div className="w-full max-w-xs">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
