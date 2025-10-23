import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Share, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TripActionButtonsProps {
  onEditTrip: () => void;
  onShare: () => void;
  onSaveToggle: () => void;
  isLoading?: boolean;
  isSaved?: boolean;
}

export const TripActionButtons = ({
  onEditTrip,
  onShare,
  onSaveToggle,
  isLoading = false,
  isSaved = false
}: TripActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop Action Buttons */}
      <div className="items-start justify-between mb-6 hidden md:flex">
        <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
           className="bg-white/10 border-bula text-bula hover:bg-bula/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
          <Button
            variant="outline"
            onClick={onEditTrip}
            className="bg-white/10 border-bula text-bula hover:bg-bula/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Trip
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="bg-white/10 border-bula text-bula hover:bg-bula/20"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
          <Button
            onClick={onSaveToggle}
            disabled={isLoading}
            className="bg-bula hover:bg-blue-800 text-white"
          >
            {isSaved ? (
              <HeartOff className="w-4 h-4 mr-2" />
            ) : (
              <Heart className="w-4 h-4 mr-2" />
            )}
            {isSaved ? 'Unsave Trip' : 'Save Trip'}
          </Button>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:hidden">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-2 py-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onEditTrip}
            className="flex items-center gap-1 px-2 py-2 text-xs"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="flex items-center gap-1 px-2 py-2 text-xs"
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
        </div>
        <Button
          onClick={onSaveToggle}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm"
        >
          {isSaved ? (
            <HeartOff className="w-4 h-4 mr-2" />
          ) : (
            <Heart className="w-4 h-4 mr-2" />
          )}
          {isSaved ? 'Unsave Trip' : 'Save Trip'}
        </Button>
      </div>
    </>
  );
};