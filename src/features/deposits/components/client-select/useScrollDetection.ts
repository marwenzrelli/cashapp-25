import { useState, useEffect, useRef, RefObject } from "react";

export const useScrollDetection = (
  contentRef: RefObject<HTMLDivElement>
): [boolean, () => void] => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const scrollStateTimeoutRef = useRef<number | null>(null);
  const lastScrollTop = useRef<number>(0);
  const scrollVelocityRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(Date.now());

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
    
    // Enhanced momentum scrolling for touch devices
    let startY = 0;
    let lastY = 0;
    let startTime = 0;
    let velocityY = 0;
    
    // Calculate scroll velocity
    const calculateScrollVelocity = (newScrollTop: number) => {
      const now = Date.now();
      const timeDelta = now - lastScrollTimeRef.current;
      const scrollDelta = Math.abs(newScrollTop - lastScrollTop.current);
      
      if (timeDelta > 0) {
        // Calculate pixels per millisecond
        scrollVelocityRef.current = scrollDelta / timeDelta;
      }
      
      lastScrollTimeRef.current = now;
    };
    
    // Handler for actual scroll events
    const handleScroll = () => {
      // Check if scroll position actually changed
      if (lastScrollTop.current !== scrollableArea.scrollTop) {
        calculateScrollVelocity(scrollableArea.scrollTop);
        setIsScrolling(true);
        lastScrollTop.current = scrollableArea.scrollTop;
        
        // Clear existing timeout
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
        
        // Keep scrolling state active for a delay after last scroll
        // Use velocity to determine how long to keep scrolling state
        const scrollDelay = Math.min(300, Math.max(150, 200 * scrollVelocityRef.current));
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, scrollDelay);
      }
    };
    
    // Touch start - record initial position
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      startY = e.touches[0].clientY;
      lastY = startY;
      startTime = Date.now();
      velocityY = 0;
      
      // Ensure the scroll area is ready for touch interaction
      scrollableArea.style.overscrollBehavior = 'contain';
      (scrollableArea.style as any)['-webkit-overflow-scrolling'] = 'touch';
    };
    
    // Touch move - detect scrolling and calculate direction/velocity
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || lastTouchY.current === null) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - lastTouchY.current);
      
      // Calculate touch velocity
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      if (timeElapsed > 0) {
        velocityY = Math.abs(lastY - currentY) / timeElapsed;
      }
      lastY = currentY;
      
      // If significant movement, consider it scrolling
      if (deltaY > 2) {
        setIsScrolling(true);
        
        // Reset timer on each significant movement
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      }
      
      lastTouchY.current = currentY;
    };
    
    // Touch end - schedule end of scrolling state and apply momentum
    const handleTouchEnd = (e: TouchEvent) => {
      if (Math.abs(velocityY) > 0.05) {
        // Apply momentum scrolling based on final velocity
        let currentVelocity = velocityY * 100; // Amplify velocity
        const direction = lastY < startY ? 1 : -1; // 1 for down, -1 for up
        
        // Create smoother momentum effect
        const animateMomentumScroll = () => {
          if (Math.abs(currentVelocity) < 0.05) return;
          
          // Apply scroll with direction
          scrollableArea.scrollBy({
            top: direction * currentVelocity * 5,
            behavior: 'auto'
          });
          
          // Reduce velocity with friction
          currentVelocity *= 0.92;
          
          if (Math.abs(currentVelocity) > 0.05) {
            requestAnimationFrame(animateMomentumScroll);
          } else {
            // End scrolling state after momentum finishes
            setTimeout(() => {
              setIsScrolling(false);
            }, 100);
          }
        };
        
        requestAnimationFrame(animateMomentumScroll);
      }
      
      touchStartY.current = null;
      lastTouchY.current = null;
      
      // Keep scrolling state active briefly after touch ends if no momentum
      if (scrollStateTimeoutRef.current) {
        window.clearTimeout(scrollStateTimeoutRef.current);
      }
      
      // Shorter delay if no significant momentum
      if (Math.abs(velocityY) <= 0.05) {
        scrollStateTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 100);
      }
    };
    
    // Ensure scrolling to end is possible - add padding
    const ensureFullScrollable = () => {
      // Add extra padding at bottom if needed
      const listContainer = scrollableArea.querySelector('.client-list-container');
      if (listContainer) {
        const extraPadding = document.createElement('div');
        extraPadding.className = 'h-48'; // 12rem extra space
        extraPadding.id = 'extra-scroll-padding';
        
        // Only add if not already present
        if (!scrollableArea.querySelector('#extra-scroll-padding')) {
          listContainer.appendChild(extraPadding);
        }
      }
    };
    
    // Initial setup to ensure full scrollability
    setTimeout(ensureFullScrollable, 300);
    
    // Add all listeners
    scrollableArea.addEventListener('scroll', handleScroll, { passive: true });
    scrollableArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollableArea.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollableArea.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      // Remove all listeners
      scrollableArea.removeEventListener('scroll', handleScroll);
      scrollableArea.removeEventListener('touchstart', handleTouchStart);
      scrollableArea.removeEventListener('touchmove', handleTouchMove);
      scrollableArea.removeEventListener('touchend', handleTouchEnd);
      
      // Clear any pending timeouts
      clearScrolling();
    };
  }, [contentRef]);

  return [isScrolling, clearScrolling];
};
