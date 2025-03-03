
import { useEffect, RefObject } from "react";

export const useClientListTouchHandlers = (
  listRef: RefObject<HTMLDivElement>
) => {
  // Add touch interactions for improved scroll behavior
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;
    
    // Enhanced touch behavior for better scrolling
    let startY = 0;
    let lastY = 0;
    let velocity = 0;
    let lastTime = 0;
    let isAnimating = false;
    
    const calculateMomentum = (distance: number, time: number) => {
      // Calculate momentum based on distance and time
      return distance / time * 0.3;
    };
    
    const animateMomentumScroll = (parent: HTMLElement, initialVelocity: number) => {
      if (!parent) return;
      
      let currentVelocity = initialVelocity;
      let lastTimestamp = performance.now();
      
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
      
      const step = (timestamp: number) => {
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // Apply easing to gradually reduce velocity
        const friction = 0.95;
        currentVelocity *= friction;
        
        // Apply scroll
        parent.scrollBy(0, currentVelocity * elapsed);
        
        // Continue animation until velocity is negligible
        if (Math.abs(currentVelocity) > 0.1) {
          window.requestAnimationFrame(step);
        } else {
          isAnimating = false;
        }
      };
      
      isAnimating = true;
      window.requestAnimationFrame(step);
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating) return;
      
      startY = e.touches[0].clientY;
      lastY = startY;
      lastTime = performance.now();
      velocity = 0;
      
      const parent = listElement.parentElement;
      if (parent) {
        // Remove any existing inertia scrolling
        parent.style.setProperty('scroll-behavior', 'auto');
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - lastY;
      const currentTime = performance.now();
      const timeElapsed = currentTime - lastTime;
      
      if (timeElapsed > 0) {
        // Calculate instantaneous velocity (pixels per ms)
        velocity = deltaY / timeElapsed;
      }
      
      lastY = currentY;
      lastTime = currentTime;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const parent = listElement.parentElement;
      if (!parent) return;
      
      // Apply momentum scrolling based on final velocity
      if (Math.abs(velocity) > 0.1) {
        animateMomentumScroll(parent, velocity * 20); // Amplify for better feel
      }
    };
    
    listElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    listElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    listElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      listElement.removeEventListener('touchstart', handleTouchStart);
      listElement.removeEventListener('touchmove', handleTouchMove);
      listElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
};
