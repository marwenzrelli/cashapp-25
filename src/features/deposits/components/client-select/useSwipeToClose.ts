
import { useEffect, useRef, RefObject } from "react";
import * as Hammer from "hammerjs";

export const useSwipeToClose = (
  elementRef: RefObject<HTMLElement>,
  isOpen: boolean,
  onClose: () => void,
  isScrolling: boolean
): void => {
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element && isOpen) {
      const hammer = new Hammer.Manager(element);
      const swipe = new Hammer.Swipe({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 50,
        velocity: 0.7
      });
      
      hammer.add(swipe);
      
      // Detect horizontal swipe for closing
      hammer.on('swipe', e => {
        // Ignore swipes during vertical scrolling
        if (isScrolling) return;
        
        // Only detect intentional horizontal swipes
        if (e.direction === Hammer.DIRECTION_LEFT && e.distance > 80 && Math.abs(e.velocityX) > 0.8) {
          console.log('Swipe horizontal gauche intentionnel détecté', {
            distance: e.distance,
            velocity: e.velocityX,
            direction: e.direction
          });
          onClose();
        }
      });
      
      return () => {
        hammer.destroy();
        if (scrollTimerRef.current) {
          window.clearTimeout(scrollTimerRef.current);
        }
      };
    }
  }, [isOpen, onClose, isScrolling, elementRef]);
};
