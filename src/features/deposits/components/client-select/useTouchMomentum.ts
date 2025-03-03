
import { RefObject, useEffect } from "react";

interface MomentumScrollOptions {
  onScrollStateChange?: (isScrolling: boolean) => void;
}

export const useTouchMomentum = (
  scrollableRef: RefObject<HTMLElement>,
  options: MomentumScrollOptions = {}
) => {
  const { onScrollStateChange } = options;

  useEffect(() => {
    const scrollElement = scrollableRef.current;
    if (!scrollElement) return;

    // Apply webkit overflow scrolling for better iOS performance
    (scrollElement.style as any)['-webkit-overflow-scrolling'] = 'touch';
    
    // Enhanced momentum scrolling for touch devices
    let startY = 0;
    let lastY = 0;
    let startTime = 0;
    let velocityY = 0;
    
    // Touch start - record initial position
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      lastY = startY;
      startTime = Date.now();
      velocityY = 0;
      
      // Ensure the scroll area is ready for touch interaction
      scrollElement.style.overscrollBehavior = 'contain';
      (scrollElement.style as any)['-webkit-overflow-scrolling'] = 'touch';
      
      if (onScrollStateChange) {
        onScrollStateChange(true);
      }
    };
    
    // Touch move - detect scrolling and calculate direction/velocity
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      
      // Calculate touch velocity
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      if (timeElapsed > 0) {
        velocityY = Math.abs(lastY - currentY) / timeElapsed;
      }
      lastY = currentY;
      
      if (onScrollStateChange) {
        onScrollStateChange(true);
      }
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
          scrollElement.scrollBy({
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
              if (onScrollStateChange) {
                onScrollStateChange(false);
              }
            }, 100);
          }
        };
        
        requestAnimationFrame(animateMomentumScroll);
      } else {
        // Shorter delay if no significant momentum
        setTimeout(() => {
          if (onScrollStateChange) {
            onScrollStateChange(false);
          }
        }, 100);
      }
    };
    
    // Add all listeners
    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      // Remove all listeners
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchmove', handleTouchMove);
      scrollElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollableRef, onScrollStateChange]);
};
