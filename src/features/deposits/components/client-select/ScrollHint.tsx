
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
    
    // Get the correct scroll area target - search for both Radix ScrollArea and fallback
    const scrollAreas = document.querySelectorAll('.scrollarea-viewport');
    const radixViewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    
    if (radixViewport) {
      console.log('ScrollHint: scrolling Radix viewport to bottom');
      radixViewport.scrollTo({
        top: radixViewport.scrollHeight,
        behavior: 'smooth'
      });
    } else if (scrollAreas.length > 0) {
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
      // Last resort - try to find any scrollable container in the dropdown
      const dropdown = document.querySelector('.client-select-content');
      if (dropdown) {
        const scrollableElements = dropdown.querySelectorAll('div');
        scrollableElements.forEach(el => {
          if (el.scrollHeight > el.clientHeight) {
            console.log('ScrollHint: found scrollable element', el);
            (el as HTMLElement).scrollTo({
              top: el.scrollHeight,
              behavior: 'smooth'
            });
          }
        });
      } else {
        console.log('ScrollHint: no scrollable elements found');
      }
    }
  };
  
  return (
    <div 
      ref={hintRef}
      className="sticky top-0 z-20 flex justify-center items-center py-2 text-xs font-medium text-muted-foreground bg-white/95 dark:bg-zinc-950/95 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors rounded-sm"
      onClick={scrollToBottom}
      onTouchStart={(e) => {
        // Prevent default to avoid any interference with the scroll
        e.stopPropagation();
      }}
      onTouchEnd={scrollToBottom}
      aria-label="Voir plus de clients"
      role="button"
    >
      <ChevronDown className="h-4 w-4 mr-1" />
      <span>Afficher plus de clients</span>
    </div>
  );
};
