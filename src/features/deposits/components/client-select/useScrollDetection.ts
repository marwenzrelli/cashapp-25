import { RefObject, useState, useEffect, useCallback } from "react";

export const useScrollDetection = (contentRef: RefObject<HTMLDivElement>) => {
  const [isScrolling, setIsScrolling] = useState(false);
  
  const clearScrolling = useCallback(() => {
    setIsScrolling(false);
  }, []);
  
  // Set up scroll detection
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Find scrollable elements within the dropdown
    const scrollAreaViewport = contentRef.current.querySelector('[data-radix-scroll-area-viewport]');
    const scrollableElements = scrollAreaViewport ? [scrollAreaViewport as HTMLElement] : [];
    
    const onScroll = () => {
      setIsScrolling(true);
      
      // Reset scrolling state after a delay
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    let scrollTimeout: number;
    
    // Set up iOS-specific optimizations
    scrollableElements.forEach(element => {
      // Apply iOS optimizations
      element.style.overscrollBehavior = 'none';
      (element.style as any)['-webkit-overflow-scrolling'] = 'touch';
      
      // Apply transform to enable hardware acceleration
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform';
      
      // Apply backface visibility hidden
      (element.style as any)['-webkit-backface-visibility'] = 'hidden';
      
      // Add scroll listener
      element.addEventListener('scroll', onScroll, { passive: true });
      
      // Enhanced touch events for iOS
      let touchStartY = 0;
      let touchStartTime = 0;
      
      const handleTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        setIsScrolling(true);
      };
      
      const handleTouchMove = () => {
        setIsScrolling(true);
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        const velocity = Math.abs(touchStartY - e.changedTouches[0].clientY) / (Date.now() - touchStartTime);
        
        const scrollTimeout = Math.max(100, Math.min(300, velocity * 500));
        setTimeout(() => {
          setIsScrolling(false);
        }, scrollTimeout);
      };
      
      // Apply iOS settings
      (element.style as any)['-webkit-overflow-scrolling'] = 'touch';
      
      // Add touch listeners
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        element.removeEventListener('scroll', onScroll);
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        clearTimeout(scrollTimeout);
      };
    });
    
  }, [contentRef, clearScrolling]);
  
  return [isScrolling, clearScrolling] as const;
};
