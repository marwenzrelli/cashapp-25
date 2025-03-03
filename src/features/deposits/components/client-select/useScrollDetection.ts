import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  scrollAreaRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const lastScrollTop = useRef<number>(0);

  const clearScrolling = () => {
    setIsScrolling(false);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea) {
      // Detect actual scroll events (most reliable)
      const handleScroll = () => {
        if (!isScrolling) {
          setIsScrolling(true);
        }
        
        // Track scroll position to detect actual movement
        const currentScrollTop = scrollArea.scrollTop;
        if (Math.abs(currentScrollTop - lastScrollTop.current) > 3) {
          // Real scrolling is happening
          setIsScrolling(true);
          lastScrollTop.current = currentScrollTop;
        }
        
        // Reset scrolling state after a delay
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 500); // Longer timeout to avoid premature interaction
      };
      
      // Detect touch start to prepare for potential scroll
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          touchStartY.current = e.touches[0].clientY;
          touchStartTime.current = Date.now();
          // Initially set scrolling when touch starts
          setIsScrolling(true);
        }
      };
      
      // Track movement to detect actual scrolling
      const handleTouchMove = (e: TouchEvent) => {
        if (
          touchStartY.current !== null && 
          touchStartTime.current !== null && 
          e.touches.length === 1
        ) {
          const currentY = e.touches[0].clientY;
          const deltaY = Math.abs(currentY - touchStartY.current);
          
          // If movement is significant, definitely scrolling
          if (deltaY > 5) {
            setIsScrolling(true);
          }
        }
      };
      
      // Detect scroll end with delay
      const handleTouchEnd = () => {
        touchStartY.current = null;
        touchStartTime.current = null;
        
        // Keep scrolling state active for a short time after touch ends
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 400); // Increased delay to avoid premature interaction
      };
      
      // Add all relevant event listeners
      scrollArea.addEventListener('scroll', handleScroll, { passive: true });
      scrollArea.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollArea.addEventListener('touchmove', handleTouchMove, { passive: true });
      scrollArea.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        scrollArea.removeEventListener('scroll', handleScroll);
        scrollArea.removeEventListener('touchstart', handleTouchStart);
        scrollArea.removeEventListener('touchmove', handleTouchMove);
        scrollArea.removeEventListener('touchend', handleTouchEnd);
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [scrollAreaRef, isScrolling]);

  return [isScrolling, clearScrolling];
};
