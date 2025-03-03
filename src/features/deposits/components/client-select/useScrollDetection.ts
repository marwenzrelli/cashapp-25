
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

  // Find the scrollable element when contentRef changes
  useEffect(() => {
    if (contentRef.current) {
      // Look for the radix viewport element
      const radixViewport = contentRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (radixViewport) {
        scrollableRef.current = radixViewport as HTMLElement;
        // Apply touch behavior improvements immediately when found
        if (scrollableRef.current) {
          (scrollableRef.current.style as any)['-webkit-overflow-scrolling'] = 'touch';
          scrollableRef.current.style.overflowY = 'auto';
          scrollableRef.current.style.touchAction = 'pan-y';
        }
        return;
      }
      
      // Look for any scrollable element
      const findScrollableElement = (element: HTMLElement): HTMLElement | null => {
        // Check if this element is scrollable
        const computedStyle = window.getComputedStyle(element);
        const hasScroll = element.scrollHeight > element.clientHeight && 
                        (computedStyle.overflowY === 'auto' || 
                        computedStyle.overflowY === 'scroll');
        
        if (hasScroll) {
          // Apply touch optimizations
          (element.style as any)['-webkit-overflow-scrolling'] = 'touch';
          element.style.overflowY = 'auto';
          element.style.touchAction = 'pan-y';
          return element;
        }
        
        // Recursively check children
        for (let i = 0; i < element.children.length; i++) {
          const result = findScrollableElement(element.children[i] as HTMLElement);
          if (result) return result;
        }
        
        return null;
      };
      
      scrollableRef.current = findScrollableElement(contentRef.current);
    }
  }, [contentRef]);

  // Add direct touch handlers for better control
  useEffect(() => {
    const scrollElement = scrollableRef.current;
    if (!scrollElement) return;
    
    let startY = 0;
    let lastY = 0;
    let touchVelocity = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchIsActiveRef.current = true;
      startY = e.touches[0].clientY;
      lastY = startY;
      setIsScrolling(true);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = lastY - currentY;
      
      // Update scroll position directly for more responsive feel
      scrollElement.scrollTop += deltaY * 1.2; // Slightly amplify movement
      
      // Calculate velocity for momentum
      touchVelocity = deltaY;
      lastY = currentY;
    };
    
    const handleTouchEnd = () => {
      touchIsActiveRef.current = false;
      
      // Apply momentum based on final velocity
      if (Math.abs(touchVelocity) > 1) {
        const momentum = touchVelocity * 10; // Amplify for better feel
        const animateMomentum = () => {
          scrollElement.scrollTop += momentum * 0.95; // Decay factor
          if (Math.abs(momentum) > 0.5) {
            requestAnimationFrame(animateMomentum);
          } else {
            // End scrolling state after momentum finishes
            setTimeout(() => {
              if (!touchIsActiveRef.current) {
                setIsScrolling(false);
              }
            }, 200);
          }
        };
        
        requestAnimationFrame(animateMomentum);
      } else {
        // No significant momentum
        setTimeout(() => {
          if (!touchIsActiveRef.current) {
            setIsScrolling(false);
          }
        }, 200);
      }
    };
    
    // Add direct touch handlers
    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
      scrollElement.removeEventListener('touchend', handleTouchEnd);
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

  // Use our custom hooks for scroll and touch handling with enhanced options
  useScrollVelocity(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling,
    scrollDelay: 250 // Increased to better detect scroll stops
  });

  useTouchMomentum(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  return [isScrolling, clearScrolling];
};
