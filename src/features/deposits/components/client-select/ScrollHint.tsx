
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
  
  return (
    <div 
      ref={hintRef}
      className="flex justify-center items-center py-2 text-xs text-muted-foreground cursor-pointer transition-all"
      onClick={() => {
        // Find the scrollable element and scroll it
        const scrollArea = document.querySelector('.client-list-container .simplebar-content-wrapper') as HTMLElement;
        
        if (scrollArea) {
          scrollArea.scrollBy({
            top: 150,
            behavior: 'smooth'
          });
        }
      }}
      onTouchStart={(e) => {
        // Prevent default to avoid any interference with the scroll
        e.stopPropagation();
        
        // Find the scrollable element and scroll it
        const scrollArea = document.querySelector('.client-list-container .simplebar-content-wrapper') as HTMLElement;
        
        if (scrollArea) {
          scrollArea.scrollBy({
            top: 150,
            behavior: 'smooth'
          });
        }
      }}
    >
      <ChevronDown className="h-4 w-4 mr-1 animate-bounce" />
      <span>Glisser pour voir tous les clients</span>
    </div>
  );
};
