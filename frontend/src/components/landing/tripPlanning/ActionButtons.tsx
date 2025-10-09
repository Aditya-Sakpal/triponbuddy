import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";

interface ActionButtonsProps {
  onPlanTrip: () => void;
  onDemo: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
  isSignedIn: boolean;
  isLoaded: boolean;
}

export const ActionButtons = ({
  onPlanTrip,
  onDemo,
  isGenerating,
  isDisabled,
  isSignedIn,
  isLoaded,
}: ActionButtonsProps) => {
  const isPlanTripDisabled = isGenerating || isDisabled || !isSignedIn;
  
  return (
    <div className="flex flex-col gap-4">
      {isLoaded && !isSignedIn && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Please{" "}
            <SignInButton mode="modal">
              <button className="underline font-bold hover:text-yellow-900">
                sign in
              </button>
            </SignInButton>
            {" "}to generate personalized trips
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="xl"
          className="px-8 font-latin"
          onClick={onPlanTrip}
          disabled={isPlanTripDisabled}
        >
          {isGenerating ? 'Planning...' : 'Plan My Trip'}
        </Button>
        <Button variant="outline" size="xl" className="px-8 font-latin border-bula" onClick={onDemo}>
          🎯 DEMO
        </Button>
      </div>
    </div>
  );
};
