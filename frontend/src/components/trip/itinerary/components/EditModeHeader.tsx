import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EditModeHeaderProps {
  isEditMode: boolean;
  onToggle: (checked: boolean) => void;
}

export const EditModeHeader = ({ isEditMode, onToggle }: EditModeHeaderProps) => {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Build Your Own Trip</CardTitle>
              <CardDescription className="text-sm">
                Customize your itinerary by removing or switching activities
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="edit-mode" checked={isEditMode} onCheckedChange={onToggle} />
            <Label htmlFor="edit-mode" className="cursor-pointer font-semibold text-blue-700">
              {isEditMode ? "Editing" : "Enable"}
            </Label>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
