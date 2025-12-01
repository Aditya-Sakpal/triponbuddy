import { useState } from "react";
import { Plus, Pen, Globe, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FloatingActionButtonProps {
  onWritePost: () => void;
  onToggleView: () => void;
  isMyPostsView: boolean;
}

export const FloatingActionButton = ({ onWritePost, onToggleView, isMyPostsView }: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleShareItinerary = () => {
    navigate("/profile?tab=trips");
    setIsExpanded(false);
  };

  const handleWritePost = () => {
    onWritePost();
    setIsExpanded(false);
  };

  return (
    <>
      <div className="fixed bottom-36 right-4 z-50 flex items-center gap-3">
        {/* Action Buttons - Show when expanded */}
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {/* Write Post Button */}
          <button
            onClick={handleWritePost}
            className="bg-black hover:bg-gray-800 text-white rounded-full p-2.5 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Write post"
            title="Write post"
          >
            <Pen size={18} />
          </button>

          {/* Share Itinerary Button */}
          <button
            onClick={handleShareItinerary}
            className="bg-black hover:bg-gray-800 text-white rounded-full p-2.5 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Share itinerary"
            title="Share itinerary"
          >
            <Globe size={18} />
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 ${
            isExpanded ? "rotate-45" : "rotate-0"
          }`}
          aria-label="Create post menu"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Toggle View Button - Below FAB */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={onToggleView}
          className="bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label={isMyPostsView ? "Show all posts" : "Show my posts"}
          title={isMyPostsView ? "Show all posts" : "Show my posts"}
        >
          {isMyPostsView ? <Users size={24} /> : <User size={24} />}
        </button>
      </div>
    </>
  );
};
