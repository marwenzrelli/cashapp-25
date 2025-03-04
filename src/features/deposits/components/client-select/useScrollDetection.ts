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
  const iOSref = useRef(typeof navigator !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !(window as any).MSStream);

  useEffect(() => {
    if (contentRef.current) {
      const findScrollArea = () => {
        const selectors = [
          '[data-radix-scroll-area-viewport]',
          '[data-radix-select-viewport]',
          '.client-scrollable-area [data-radix-scroll-area-viewport]'
        ];
        
        for (const selector of selectors) {
          const element = contentRef.current?.querySelector(selector);
          if (element) {
            scrollableRef.current = element as HTMLElement;
            console.log(`Found scrollable element using selector: ${selector}`);
            
            if (iOSref.current) {
              scrollableRef.current.style.WebkitOverflowScrolling = 'touch';
              scrollableRef.current.style.overscrollBehavior = 'contain';
              scrollableRef.current.style.touchAction = 'pan-y';
              scrollableRef.current.style.transform = 'translateZ(0)';
              scrollableRef.current.style.WebkitBackfaceVisibility = 'hidden';
              console.log('Applied iOS-specific scroll optimizations');
            }
            
            return true;
          }
        }
        
        return false;
      };
      
      if (!findScrollArea()) {
        const retryInterval = setInterval(() => {
          if (findScrollArea()) {
            clearInterval(retryInterval);
          }
        }, 50);
        
        setTimeout(() => clearInterval(retryInterval), 2000);
      }
    }
  }, [contentRef]);

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
      
      if (iOSref.current) {
        scrollElement.style.overflow = 'auto';
        scrollElement.style.WebkitOverflowScrolling = 'touch';
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = lastY - currentY;
      lastY = currentY;
      
      const now = Date.now();
      const timeDelta = now - lastTouchTime.current;
      lastTouchTime.current = now;
      
      if (timeDelta > 0) {
        velocityY = Math.abs(deltaY) / timeDelta;
      }
      
      if (iOSref.current && Math.abs(deltaY) > 0) {
        scrollElement.scrollTop += deltaY * (iOSref.current ? 1.2 : 1);
      }
      
      setIsScrolling(true);
    };
    
    const handleTouchEnd = () => {
      touchIsActiveRef.current = false;
      
      const scrollingDelay = iOSref.current 
        ? Math.min(800, Math.max(300, velocityY * 400))
        : Math.min(500, Math.max(200, velocityY * 300));
      
      if (scrollStateTimeoutRef.current) {
        window.clearTimeout(scrollStateTimeoutRef.current);
      }
      
      scrollStateTimeoutRef.current = window.setTimeout(() => {
        if (!touchIsActiveRef.current) {
          setIsScrolling(false);
        }
      }, scrollingDelay);
    };
    
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

  useScrollVelocity(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling,
    scrollDelay: 300
  });

  useTouchMomentum(scrollableRef as RefObject<HTMLElement>, {
    onScrollStateChange: setIsScrolling
  });

  return [isScrolling, clearScrolling];
};
