
import { useEffect, RefObject } from "react";

interface TouchScrollOptions {
  onClose?: () => void;
  openState: boolean;
}

export const useDropdownTouchInteractions = (
  scrollableAreaRef: RefObject<HTMLDivElement>,
  options: TouchScrollOptions
) => {
  const { onClose, openState } = options;

  // Setup touch interactions and scrolling behavior
  useEffect(() => {
    if (openState && scrollableAreaRef.current) {
      // Add passive touch listeners for better scrolling
      const scrollElement = scrollableAreaRef.current;
      
      // Set CSS properties for better touch scrolling
      scrollElement.style.cssText += 'overscroll-behavior: contain; -webkit-overflow-scrolling: touch;';
      
      // Setup initial scroll position to enable smooth scrolling
      setTimeout(() => {
        // Initial small scroll to enable momentum scrolling on iOS
        if (scrollElement.scrollTop === 0) {
          scrollElement.scrollTop = 1;
        }
      }, 100);

      // Enhanced touch handling for intuitive scrolling
      let startY = 0;
      let lastY = 0;
      let velocity = 0;
      let startTime = 0;
      let isSwipingDown = false;

      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY;
        lastY = startY;
        startTime = Date.now();
        isSwipingDown = false;
        velocity = 0;
      };

      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - lastY;
        const currentTime = Date.now();
        const timeElapsed = currentTime - startTime;
        
        // Calculate velocity in px/ms
        if (timeElapsed > 0) {
          velocity = deltaY / timeElapsed;
        }
        
        // If at top of list and swiping down, apply natural resistance
        if (deltaY > 0 && scrollElement.scrollTop <= 1) {
          isSwipingDown = true;
          // Apply some resistance for natural feel
          scrollElement.scrollTop = 0;
          // Prevent default only when needed
          e.preventDefault();
        }
        
        // Update for next move
        lastY = currentY;
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        // Apply momentum scrolling on touch end
        if (Math.abs(velocity) > 0.1) {
          let currentVelocity = velocity * 20; // Amplify for better feel
          const direction = Math.sign(currentVelocity);
          
          const animateMomentumScroll = () => {
            scrollElement.scrollBy(0, currentVelocity);
            currentVelocity *= 0.95; // Apply friction
            
            if (Math.abs(currentVelocity) > 0.5) {
              requestAnimationFrame(animateMomentumScroll);
            }
          };
          
          requestAnimationFrame(animateMomentumScroll);
        }
        
        // If swiping down at top of list with force, consider it a close gesture
        if (isSwipingDown && velocity > 0.5 && onClose) {
          onClose();
        }
      };

      scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        scrollElement.removeEventListener('touchstart', handleTouchStart);
        scrollElement.removeEventListener('touchmove', handleTouchMove);
        scrollElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [openState, onClose, scrollableAreaRef]);
};
