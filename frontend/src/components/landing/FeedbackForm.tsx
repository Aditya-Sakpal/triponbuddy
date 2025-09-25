import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import type { FeedbackType } from "@/constants";
import type { UseFeedbackFormReturn } from "@/hooks/useFeedbackForm";
import { FEEDBACK_TYPES, RATING_STARS } from "@/constants";

interface FeedbackFormProps {
  formLogic: UseFeedbackFormReturn;
}

export const FeedbackForm = ({ formLogic }: FeedbackFormProps) => {
  const {
    formData,
    rating,
    hoveredRating,
    isSubmitting,
    handleInputChange,
    handleRatingChange,
    handleRatingHover,
    handleSubmit,
  } = formLogic;

  return (
    <Card className="p-8 overflow-x-hidden">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name *
            </label>
            <Input
              placeholder="Enter your name"
              className="w-full"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Email *
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Feedback Type
            </label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              value={formData.feedback_type}
              onChange={(e) => handleInputChange("feedback_type", e.target.value as FeedbackType)}
            >
              {FEEDBACK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Feedback *
            </label>
            <Textarea
              placeholder="Tell us what you think..."
              rows={4}
              className="w-full resize-none"
              value={formData.feedback}
              onChange={(e) => handleInputChange("feedback", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rate Your Experience *
            </label>
            <div className="flex space-x-1">
              {RATING_STARS.map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={() => handleRatingHover(0)}
                  onClick={() => handleRatingChange(star)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg font-latin"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
