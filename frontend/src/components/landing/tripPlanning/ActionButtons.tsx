import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onPlanTrip: () => void;
  onDemo: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

export const ActionButtons = ({
  onPlanTrip,
  onDemo,
  isGenerating,
  isDisabled,
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="xl"
        className="px-8 font-latin"
        onClick={onPlanTrip}
        disabled={isGenerating || isDisabled}
      >
        {isGenerating ? 'Planning...' : 'Plan My Trip'}
      </Button>
      <Button variant="outline" size="xl" className="px-8 font-latin border-bula" onClick={onDemo}>
        🎯 DEMO
      </Button>
    </div>
  );
};
