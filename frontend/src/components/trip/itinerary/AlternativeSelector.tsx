import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ActivityCard } from "@/components/trip";
import { LoadingState } from "@/components/shared/LoadingState";
import { AlternativePreview } from "./AlternativePreview";
import type { AlternativeSelectorProps } from "./types";

export const AlternativeSelector = ({
  switchingActivity,
  alternativeImages,
  onSelectAlternative,
  onCancelSwitch,
  hideTime = false
}: AlternativeSelectorProps) => {
  const idPrefix = hideTime ? 'desktop' : 'mobile';
  
  return (
    <div className="mt-4 space-y-4">
      {/* Selected Alternative Preview */}
      {switchingActivity.selectedAlternative && (
        <AlternativePreview selectedAlternative={switchingActivity.selectedAlternative} />
      )}
      
      {/* Alternatives List with Radio Buttons */}
      <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
        <h4 className="font-semibold text-lg mb-3 text-blue-900">Choose an Alternative:</h4>
        {switchingActivity.loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            <RadioGroup
              value={switchingActivity.selectedAlternative?.activity || ""}
              onValueChange={(value) => {
                const selected = switchingActivity.alternatives.find(alt => alt.activity === value);
                onSelectAlternative?.(selected || null);
              }}
            >
              {switchingActivity.alternatives.map((alt, altIndex) => (
                <div
                  key={altIndex}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    switchingActivity.selectedAlternative?.activity === alt.activity
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-blue-400 bg-white'
                  }`}
                  onClick={() => onSelectAlternative?.(alt)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem 
                      value={alt.activity} 
                      id={`alt-${idPrefix}-${switchingActivity.index}-${altIndex}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`alt-${idPrefix}-${switchingActivity.index}-${altIndex}`}
                      className="flex-1 cursor-pointer"
                    >
                      <ActivityCard
                        activity={alt}
                        imageUrl={alternativeImages?.[alt.image_search_query]}
                        hideTime={hideTime}
                      />
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
            <button
              onClick={onCancelSwitch}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
