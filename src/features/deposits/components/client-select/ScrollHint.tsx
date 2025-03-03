
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
      className="sticky top-0 flex justify-center items-center py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 active:bg-muted/50 transition-all"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Find the ScrollArea viewport and scroll to the bottom
        const scrollArea = document.querySelector('.client-list-container .scrollarea-viewport') as HTMLElement;
        if (scrollArea) {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          });
        }
      }}
      onTouchStart={(e) => {
        // Prevent default to avoid any interference with the scroll
        e.stopPropagation();
      }}
    >
      <ChevronDown className="h-4 w-4 mr-1 animate-bounce" />
      <span>Glisser pour voir tous les clients</span>
    </div>
  );
};
