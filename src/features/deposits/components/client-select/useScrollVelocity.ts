import { RefObject, useEffect } from "react";

interface ScrollVelocityOptions {
  onScrollStateChange?: (isScrolling: boolean) => void;
  scrollDelay?: number;
}

export const useScrollVelocity = (
  scrollableRef: RefObject<HTMLElement>,
  options: ScrollVelocityOptions = {}
) => {
  const { 
    onScrollStateChange,
    scrollDelay = 150
  } = options;

  useEffect(() => {
    const scrollElement = scrollableRef.current;
    if (!scrollElement) return;
    
    let lastScrollTop = 0;
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();
    let scrollTimerId: number | null = null;
    
    // Calculate scroll velocity
    const calculateScrollVelocity = (newScrollTop: number) => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime;
      const scrollDelta = Math.abs(newScrollTop - lastScrollTop);
      
      if (timeDelta > 0) {
        // Calculate pixels per millisecond
        scrollVelocity = scrollDelta / timeDelta;
      }
      
      lastScrollTime = now;
    };
    
    // Handler for actual scroll events
    const handleScroll = () => {
      // Check if scroll position actually changed
      if (lastScrollTop !== scrollElement.scrollTop) {
        calculateScrollVelocity(scrollElement.scrollTop);
        if (onScrollStateChange) {
          onScrollStateChange(true);
        }
        lastScrollTop = scrollElement.scrollTop;
        
        // Clear existing timeout
        if (scrollTimerId) {
          window.clearTimeout(scrollTimerId);
        }
        
        // Keep scrolling state active for a delay after last scroll
        // Use velocity to determine how long to keep scrolling state
        const delay = Math.min(300, Math.max(scrollDelay, 200 * scrollVelocity));
        scrollTimerId = window.setTimeout(() => {
          if (onScrollStateChange) {
            onScrollStateChange(false);
          }
        }, delay);
      }
    };
    
    // Add scroll listener
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      // Remove scroll listener
      scrollElement.removeEventListener('scroll', handleScroll);
      
      // Clear any pending timeouts
      if (scrollTimerId) {
        window.clearTimeout(scrollTimerId);
      }
    };
  }, [scrollableRef, onScrollStateChange, scrollDelay]);
};
