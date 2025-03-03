
import { useState, useRef, RefObject, useEffect } from "react";
import { useTouchMomentum } from "./useTouchMomentum";
import { useScrollVelocity } from "./useScrollVelocity";

export const useScrollDetection = (
  contentRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const scrollStateTimeoutRef = useRef<number | null>(null);
  const scrollableRef = useRef<HTMLElement | null>(null);
  const touchIsActiveRef = useRef(false);
  const lastTouchTime = useRef(Date.now());

  // Find the scrollable element when contentRef changes
  useEffect(() => {
    if (contentRef.current) {
      // Enhanced search for the radix viewport element
      const findScrollArea = () => {
        // Look first for the direct radix viewport
        const radixViewport = contentRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (radixViewport) {
          scrollableRef.current = radixViewport as HTMLElement;
          console.log('Found direct radix viewport');
          return true;
        }
        
        // Next try finding in the client list container
        const clientListContainer = contentRef.current?.querySelector('.client-list-container');
        if (clientListContainer) {
          const containerViewport = clientListContainer.querySelector('[data-radix-scroll-area-viewport]');
          if (containerViewport) {
            scrollableRef.current = containerViewport as HTMLElement;
            console.log('Found viewport in client list container');
            return true;
          }
        }
        
        return false;
      };
      
      // Try to find the scrollable element, and if not found, try again after a short delay
      if (!findScrollArea()) {
        const retryFindInterval = setInterval(() => {
          if (findScrollArea()) {
            clearInterval(retryFindInterval);
            
            // Apply optimizations when found
            if (scrollableRef.current) {
              (scrollableRef.current.style as any)['-webkit-overflow-scrolling'] = 'touch';
              scrollableRef.current.style.overscrollBehavior = 'contain';
              scrollableRef.current.style.touchAction = 'pan-y';
              console.log('Applied touch optimizations to scrollable area');
            }
          }
        }, 100);
        
        // Clear interval after 2 seconds if nothing found
        setTimeout(() => clearInterval(retryFindInterval), 2000);
      } else if (scrollableRef.current) {
        // Apply optimizations immediately if found
        (scrollableRef.current.style as any)['-webkit-overflow-scrolling'] = 'touch';
        scrollableRef.current.style.overscrollBehavior = 'contain';
        scrollableRef.current.style.touchAction = 'pan-y';
        console.log('Applied touch optimizations to scrollable area');
      }
    }
  }, [contentRef]);

  // Add enhanced direct touch handlers
  useEffect(() => {
    const scrollElement = scrollableRef.current;
    if (!scrollElement) return;
    
    let startY = 0;
    let lastY = 0;
    let velocityY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchIsActiveRef.current = true;
      startY = e.touches[0].clientY;
      lastY = startY;
      lastTouchTime.current = Date.now();
      setIsScrolling(true);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = lastY - currentY;
      lastY = currentY;
      
      // Calculate velocity
      const now = Date.now();
      const timeDelta = now - lastTouchTime.current;
      lastTouchTime.current = now;
      
      if (timeDelta > 0) {
        velocityY = Math.abs(deltaY) / timeDelta;
      }
      
      setIsScrolling(true);
    };
    
    const handleTouchEnd = () => {
      touchIsActiveRef.current = false;
      
      // Delay the end of scrolling based on final velocity
      const scrollingDelay = Math.min(500, Math.max(200, velocityY * 300));
      
      // Clear any existing timeout
      if (scrollStateTimeoutRef.current) {
        window.clearTimeout(scrollStateTimeoutRef.current);
      }
      
      // Set new timeout
      scrollStateTimeoutRef.current = window.setTimeout(() => {
        if (!touchIsActiveRef.current) {
          setIsScrolling(false);
        }
      }, scrollingDelay);
    };
    
    // Add direct touch handlers with passive true for better performance
    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
      scrollElement.removeEventListener('touchend', handleTouchEnd);
      
      if (scrollStateTimeoutRef.current) {
        window.clearTimeout(scrollStateTimeoutRef.current);
      }
    };
  }, [scrollableRef.current]);

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

  // Use our custom hooks with improved options
  useScrollVelocity(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling,
    scrollDelay: 300 // Increased for better detection
  });

  useTouchMomentum(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  return [isScrolling, clearScrolling];
};
