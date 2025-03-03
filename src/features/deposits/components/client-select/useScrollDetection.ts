import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  contentRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
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

  useEffect(() => {
    const contentArea = contentRef.current;
    if (!contentArea) return;

    // Get the scrollable element (the overflow-y-auto element)
    const scrollableArea = contentArea.querySelector('.overflow-y-auto') as HTMLElement;
    if (!scrollableArea) return;
    
    // Handler for actual scroll events
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
      
      // Keep scrolling state active for a delay after last scroll
      scrollTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 200);
    };
    
    // Touch start - record initial position
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
    };
    
    // Touch move - detect scrolling
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || lastTouchY.current === null) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - lastTouchY.current);
      
      // If significant movement, consider it scrolling
      if (deltaY > 3) {
        setIsScrolling(true);
        
        // Reset timer on each significant movement
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      }
      
      lastTouchY.current = currentY;
    };
    
    // Touch end - schedule end of scrolling state
    const handleTouchEnd = () => {
      touchStartY.current = null;
      lastTouchY.current = null;
      
      // Keep scrolling state active briefly after touch ends
      if (scrollStateTimeoutRef.current) {
        window.clearTimeout(scrollStateTimeoutRef.current);
      }
      
      // Delay longer to prevent accidental taps right after scrolling
      scrollStateTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    // Add all listeners
    scrollableArea.addEventListener('scroll', handleScroll, { passive: true });
    contentArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentArea.addEventListener('touchmove', handleTouchMove, { passive: true });
    contentArea.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      // Remove all listeners
      scrollableArea.removeEventListener('scroll', handleScroll);
      contentArea.removeEventListener('touchstart', handleTouchStart);
      contentArea.removeEventListener('touchmove', handleTouchMove);
      contentArea.removeEventListener('touchend', handleTouchEnd);
      
      // Clear any pending timeouts
      clearScrolling();
    };
  }, [contentRef]);

  return [isScrolling, clearScrolling];
};
