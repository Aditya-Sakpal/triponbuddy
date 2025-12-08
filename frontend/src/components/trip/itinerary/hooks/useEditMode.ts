import { useState, useEffect, useRef } from "react";

interface UseEditModeProps {
  onDisable?: () => void;
}

/**
 * Custom hook to manage edit mode state
 */
export const useEditMode = ({ onDisable }: UseEditModeProps = {}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const onDisableRef = useRef(onDisable);
  const prevIsEditMode = useRef(isEditMode);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onDisableRef.current = onDisable;
  }, [onDisable]);

  // Only call onDisable when transitioning from edit mode to non-edit mode
  useEffect(() => {
    if (prevIsEditMode.current && !isEditMode) {
      onDisableRef.current?.();
    }
    prevIsEditMode.current = isEditMode;
  }, [isEditMode]);

  return {
    isEditMode,
    setIsEditMode,
  };
};
