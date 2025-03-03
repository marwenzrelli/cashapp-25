
import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  scrollAreaRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);

  const clearScrolling = () => {
    setIsScrolling(false);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea) {
      // Detect scroll start
      const handleTouchStart = () => {
        setIsScrolling(true);
      };
      
      // Detect scroll end with delay
      const handleTouchEnd = () => {
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 200);
      };
      
      scrollArea.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollArea.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        scrollArea.removeEventListener('touchstart', handleTouchStart);
        scrollArea.removeEventListener('touchend', handleTouchEnd);
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [scrollAreaRef]);

  return [isScrolling, clearScrolling];
};
