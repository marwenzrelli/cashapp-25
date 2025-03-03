
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

interface ScrollHintProps {
  show: boolean;
}

export const ScrollHint = ({ show }: ScrollHintProps) => {
  const hintRef = useRef<HTMLDivElement>(null);
  
  if (!show) return null;
  
  // Improved function to scroll to bottom of list
  const scrollToBottom = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ScrollHint: attempting to scroll to bottom');
    
    // Try multiple methods to find the scrollable container
    
    // Method 1: Try the ScrollArea viewport
    const scrollAreaViewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (scrollAreaViewport) {
      console.log('ScrollHint: found ScrollArea viewport, scrolling to bottom');
      scrollAreaViewport.scrollTo({
        top: scrollAreaViewport.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Method 2: Try the client-scrollable-area class
    const scrollableArea = document.querySelector('.client-scrollable-area [data-radix-scroll-area-viewport]') as HTMLElement;
    if (scrollableArea) {
      console.log('ScrollHint: found client-scrollable-area, scrolling to bottom');
      scrollableArea.scrollTo({
        top: scrollableArea.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Method 3: Find any element with overflow in the dropdown
    const clientListContainer = document.querySelector('.client-list-container');
    if (clientListContainer) {
      const scrollElements = clientListContainer.querySelectorAll('[data-radix-scroll-area-viewport]');
      let scrolled = false;
      
      scrollElements.forEach(el => {
        const element = el as HTMLElement;
        console.log('ScrollHint: found scrollable element in client list', element);
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
        scrolled = true;
      });
      
      if (scrolled) return;
    }
    
    // Last resort: try to find any scrollable element in the dropdown
    const dropdown = document.querySelector('.client-select-content');
    if (dropdown) {
      const scrollables = dropdown.querySelectorAll('*');
      scrollables.forEach(el => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const hasScroll = element.scrollHeight > element.clientHeight && 
                        (computedStyle.overflowY === 'auto' || 
                         computedStyle.overflowY === 'scroll');
        
        if (hasScroll) {
          console.log('ScrollHint: found scrollable element in dropdown', element);
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
