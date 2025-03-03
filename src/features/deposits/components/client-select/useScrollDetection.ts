import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  scrollAreaRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const lastScrollTop = useRef<number>(0);
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
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea) {
      // Track when touch interaction starts
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          touchStartY.current = e.touches[0].clientY;
          touchStartTime.current = Date.now();
          // Do not immediately set scrolling=true to avoid false positives
          // for simple taps/clicks
        }
      };
      
      // Track actual scroll events
      const handleScroll = () => {
        setIsScrolling(true);
        
        // Reset any existing timeout
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        // Keep scrolling state active for a delay after last scroll event
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 300);
      };
      
      // Track touch movements to detect scrolling intent
      const handleTouchMove = (e: TouchEvent) => {
        if (touchStartY.current !== null && e.touches.length === 1) {
          const moveDistance = Math.abs(e.touches[0].clientY - touchStartY.current);
          
          // If significant vertical movement, consider it scrolling
          if (moveDistance > 10) {
            setIsScrolling(true);
          }
        }
      };
      
      // Handle touch end
      const handleTouchEnd = () => {
        // Reset touch tracking
        touchStartY.current = null;
        
        // Keep scrolling state active briefly after touch ends
        // to prevent premature selection
        if (scrollStateTimeoutRef.current) {
          window.clearTimeout(scrollStateTimeoutRef.current);
        }
        
        scrollStateTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 200);
      };
      
      // Add all event listeners
      scrollArea.addEventListener('scroll', handleScroll, { passive: true });
      scrollArea.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollArea.addEventListener('touchmove', handleTouchMove, { passive: true });
      scrollArea.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        scrollArea.removeEventListener('scroll', handleScroll);
        scrollArea.removeEventListener('touchstart', handleTouchStart);
        scrollArea.removeEventListener('touchmove', handleTouchMove);
        scrollArea.removeEventListener('touchend', handleTouchEnd);
        
        // Clear any pending timeouts
        clearScrolling();
      };
    }
  }, [scrollAreaRef]);

  return [isScrolling, clearScrolling];
};
