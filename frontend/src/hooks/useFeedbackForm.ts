import { useState, useEffect } from "react";
import { useSubmitFeedback } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import { useUser } from "@clerk/clerk-react";
import type { FeedbackCreate, FeedbackType } from "@/lib/types";
import {
  validateFeedbackForm,
  createFeedbackData,
  FEEDBACK_VALIDATION_MESSAGES
} from "@/utils/feedbackUtils";

export interface FeedbackFormData {
  name: string;
  email: string;
  feedback: string;
  feedback_type: FeedbackType;
}

export interface UseFeedbackFormReturn {
  formData: FeedbackFormData;
  rating: number;
  hoveredRating: number;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  handleInputChange: (field: string, value: string) => void;
  handleRatingChange: (rating: number) => void;
  handleRatingHover: (rating: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export const useFeedbackForm = (): UseFeedbackFormReturn => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: "",
    email: "",
    feedback: "",
    feedback_type: "general",
  });

  // Authentication
  const { user, isSignedIn, isLoaded } = useUser();
  const { userId, setUser: setAuthUser } = useAuthStore();
  const submitFeedbackMutation = useSubmitFeedback();
  const isAuthenticated = isLoaded && isSignedIn && !!userId;

  // Sync Clerk authentication with auth store
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setAuthUser(user.id);
    }
  }, [isLoaded, isSignedIn, user, setAuthUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      feedback: "",
      feedback_type: "general",
    });
    setRating(0);
    setHoveredRating(0);
  };

  const validateForm = (): string | null => {
    return validateFeedbackForm(
      formData.name,
      formData.email,
      formData.feedback,
      rating,
      isAuthenticated
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const feedbackData: FeedbackCreate = createFeedbackData(
      formData,
      rating,
      window.location.href
    );

    try {
      await submitFeedbackMutation.mutateAsync({
        feedback: feedbackData,
        userId: userId!,
      });

      resetForm();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      throw error; // Re-throw to let the component handle it
    }
  };

  return {
    formData,
    rating,
    hoveredRating,
    isSubmitting: submitFeedbackMutation.isPending,
    isAuthenticated: isLoaded && isSignedIn && !!userId,
    handleInputChange,
    handleRatingChange,
    handleRatingHover,
    handleSubmit,
    resetForm,
  };
};
