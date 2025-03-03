
import { useState, useRef, RefObject } from "react";
import { useTouchMomentum } from "./useTouchMomentum";
import { useScrollVelocity } from "./useScrollVelocity";

export const useScrollDetection = (
  contentRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const scrollStateTimeoutRef = useRef<number | null>(null);

  const clearScrolling = () => {
    setIsScrolling(false);
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    if (scrollStateTimeoutRef.current) {
      window.clearTimeout(scrollStateTimeoutRef.current);
      scrollStateTimeoutRef.current = null;
    }
  };

  // Helper to get the scrollable element
  const getScrollableElement = (): HTMLElement | null => {
    if (!contentRef.current) return null;
    const scrollableArea = contentRef.current.querySelector('.overflow-y-auto') as HTMLElement;
    return scrollableArea || null;
  };

  // Create a ref for the scrollable element
  const scrollableRef = useRef<HTMLElement | null>(getScrollableElement());

  // Use our custom hooks for scroll and touch handling
  useScrollVelocity(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  useTouchMomentum(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  return [isScrolling, clearScrolling];
};
