
import { ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";

interface ScrollHintProps {
  show: boolean;
}

export const ScrollHint = ({ show }: ScrollHintProps) => {
  const hintRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!show || !hintRef.current) return;
    
    // Add subtle animation to make the hint more noticeable
    const element = hintRef.current;
    let direction = 1;
    let position = 0;
    
    const animate = () => {
      if (!element) return;
      
      position += 0.3 * direction;
      
      if (position > 4) {
        direction = -1;
      } else if (position < 0) {
        direction = 1;
      }
      
      element.style.transform = `translateY(${position}px)`;
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [show]);
  
  if (!show) return null;
  
  // Function to scroll to bottom of list
  const scrollToBottom = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the correct scroll area target
    const scrollAreas = document.querySelectorAll('.scrollarea-viewport');
    if (scrollAreas.length > 0) {
      // Use the most recently rendered scroll area (likely the one in view)
      const scrollArea = scrollAreas[scrollAreas.length - 1] as HTMLElement;
      console.log('ScrollHint: scrolling to bottom, element found:', !!scrollArea);
      if (scrollArea) {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        });
      }
    } else {
      console.log('ScrollHint: no scrollarea-viewport found');
    }
  };
  
  return (
    <div 
      ref={hintRef}
      className="sticky top-0 z-20 flex justify-center items-center py-2 text-xs text-muted-foreground bg-white/90 dark:bg-zinc-950/90 cursor-pointer active:bg-muted transition-colors"
      onClick={scrollToBottom}
      onTouchStart={(e) => {
        // Prevent default to avoid any interference with the scroll
        e.stopPropagation();
      }}
      onTouchEnd={scrollToBottom}
    >
      <ChevronDown className="h-4 w-4 mr-1 animate-bounce" />
      <span>Glisser pour voir tous les clients</span>
    </div>
  );
};
