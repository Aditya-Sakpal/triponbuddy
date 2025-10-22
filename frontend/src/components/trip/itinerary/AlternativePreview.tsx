import type { AlternativePreviewProps } from "./types";

export const AlternativePreview = ({ selectedAlternative }: AlternativePreviewProps) => {
  return (
    <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-base text-green-900 mb-1">
            ✓ Selected: {selectedAlternative.activity}
          </h4>
          <p className="text-sm text-gray-700">{selectedAlternative.description}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-green-700 whitespace-nowrap">
          <span>₹</span>
          <span>{selectedAlternative.estimated_cost}</span>
        </div>
      </div>
    </div>
  );
};
