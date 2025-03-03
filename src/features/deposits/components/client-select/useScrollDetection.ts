
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

  // Find the scrollable element when contentRef changes
  useEffect(() => {
    if (contentRef.current) {
      // Look for the radix viewport element
      const radixViewport = contentRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (radixViewport) {
        scrollableRef.current = radixViewport as HTMLElement;
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

  // Use our custom hooks for scroll and touch handling
  useScrollVelocity(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  useTouchMomentum(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  return [isScrolling, clearScrolling];
};
