import { useState, useEffect } from "react";

interface UseEditModeProps {
  onDisable?: () => void;
}

/**
 * Custom hook to manage edit mode state
 */
export const useEditMode = ({ onDisable }: UseEditModeProps = {}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      onDisable?.();
    }
  }, [isEditMode, onDisable]);

  return {
    isEditMode,
    setIsEditMode,
  };
};
