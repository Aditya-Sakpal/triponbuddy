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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onEditTrip}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Trip
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
          <Button
            onClick={onSaveToggle}
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onEditTrip}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Trip
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
          >
            <Share className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
        </div>
        <Button
          onClick={onSaveToggle}
          disabled={isLoading}
          className="w-full"
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