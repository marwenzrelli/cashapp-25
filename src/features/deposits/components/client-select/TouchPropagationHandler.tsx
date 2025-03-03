
import { useEffect, RefObject } from "react";

interface TouchPropagationHandlerProps {
  contentRef: RefObject<HTMLDivElement>;
  openState: boolean;
}

export const TouchPropagationHandler = ({ contentRef, openState }: TouchPropagationHandlerProps) => {
  // Prevent automatic closing from Select component when touching inside our custom content
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (openState && contentRef.current?.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [openState, contentRef]);

  return null;
};
