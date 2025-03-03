
import { ArrowDown } from "lucide-react";
import { useRef, useEffect } from "react";

interface ScrollHintProps {
  show: boolean;
}

export const ScrollHint = ({ show }: ScrollHintProps) => {
  const hintRef = useRef<HTMLDivElement>(null);
  
  // We'll remove the existing animation as it's causing issues
  
  if (!show) return null;
  
  // Function to scroll to bottom of list
  const scrollToBottom = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ScrollHint: attempting to scroll to bottom');
    
    // Try multiple methods to find the scrollable container
    
    // Method 1: Try the Radix viewport directly
    const radixViewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (radixViewport) {
      console.log('ScrollHint: found Radix viewport, scrolling to bottom');
      radixViewport.scrollTo({
        top: radixViewport.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Method 2: Try scrollarea-viewport class
    const scrollAreas = document.querySelectorAll('.scrollarea-viewport');
    if (scrollAreas.length > 0) {
      const scrollArea = scrollAreas[scrollAreas.length - 1] as HTMLElement;
      console.log('ScrollHint: found scrollarea-viewport, scrolling to bottom');
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Method 3: Find any element with overflow in the dropdown
    const clientListContainer = document.querySelector('.client-list-container');
    if (clientListContainer) {
      const scrollElements = clientListContainer.querySelectorAll('*');
      let scrolled = false;
      
      scrollElements.forEach(el => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const hasScroll = element.scrollHeight > element.clientHeight && 
                         (computedStyle.overflowY === 'auto' || 
                          computedStyle.overflowY === 'scroll');
        
        if (hasScroll) {
          console.log('ScrollHint: found scrollable element', element);
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
          scrolled = true;
        }
      });
      
      if (scrolled) return;
    }
    
    // Last resort: try to find the ScrollArea component
    const scrollArea = document.querySelector('.h-\\[calc\\(100vh-220px\\)\\]');
    if (scrollArea) {
      const scrollables = scrollArea.querySelectorAll('*');
      scrollables.forEach(el => {
        const element = el as HTMLElement;
        if (element.scrollHeight > element.clientHeight) {
          console.log('ScrollHint: found scrollable element in ScrollArea', element);
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  };
  
  return (
    <div 
      ref={hintRef}
      className="sticky top-0 z-20 flex justify-center items-center py-3 px-2 text-sm font-medium text-primary bg-white/95 dark:bg-zinc-950/95 cursor-pointer hover:bg-muted/50 active:bg-muted/80 transition-colors rounded-sm shadow-sm border-b"
      onClick={scrollToBottom}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={scrollToBottom}
      aria-label="Voir plus de clients"
      role="button"
    >
      <ArrowDown className="h-5 w-5 mr-2 text-primary" />
      <span>Afficher plus de clients</span>
    </div>
  );
};
