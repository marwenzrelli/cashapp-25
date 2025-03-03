
import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  scrollAreaRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const clearScrolling = () => {
    setIsScrolling(false);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea) {
      // Detect scroll start with improved touch tracking
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          touchStartY.current = e.touches[0].clientY;
          touchStartTime.current = Date.now();
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
          const deltaTime = Date.now() - touchStartTime.current;
          
          // If movement is significant, consider it scrolling
          if (deltaY > 10 && deltaTime < 300) {
            setIsScrolling(true);
          }
        }
      };
      
      // Detect scroll end with delay
      const handleTouchEnd = () => {
        touchStartY.current = null;
        touchStartTime.current = null;
        
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 300); // Increased delay to avoid premature interaction
      };
      
      scrollArea.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollArea.addEventListener('touchmove', handleTouchMove, { passive: true });
      scrollArea.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        scrollArea.removeEventListener('touchstart', handleTouchStart);
        scrollArea.removeEventListener('touchmove', handleTouchMove);
        scrollArea.removeEventListener('touchend', handleTouchEnd);
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [scrollAreaRef]);

  return [isScrolling, clearScrolling];
};
