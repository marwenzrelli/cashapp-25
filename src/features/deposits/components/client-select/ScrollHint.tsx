
import { ArrowDown } from "lucide-react";
import { useRef, useEffect } from "react";

interface ScrollHintProps {
  show: boolean;
}

export const ScrollHint = ({ show }: ScrollHintProps) => {
  const hintRef = useRef<HTMLDivElement>(null);
  
  // Always define the scroll to bottom function, whether visible or not
  const scrollToBottom = (e: React.MouseEvent | React.TouchEvent) => {
    if (!show) return; // Skip operation if not shown
    
    e.preventDefault();
    e.stopPropagation();
    
    // Direct targeting of the ScrollArea viewport
    const container = document.querySelector('.client-list-container');
    if (!container) return;
    
    const scrollAreaViewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (scrollAreaViewport) {
      // Calculate the height of all content
      const contentHeight = scrollAreaViewport.scrollHeight;
      const containerHeight = scrollAreaViewport.clientHeight;
      
      // Use smooth scrolling with sufficient distance
      scrollAreaViewport.scrollTo({
        top: contentHeight - containerHeight,
        behavior: 'smooth'
      });
      
      // Add a quick feedback visual effect
      if (hintRef.current) {
        hintRef.current.classList.add('bg-muted/70');
        setTimeout(() => {
          if (hintRef.current) {
            hintRef.current.classList.remove('bg-muted/70');
          }
        }, 200);
      }
    }
  };
  
  // Enhanced touch interactions - always defined, not conditional on show
  useEffect(() => {
    const hintElement = hintRef.current;
    if (!hintElement) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!show) return; // Skip operation if not shown
      e.stopPropagation();
      hintElement.classList.add('bg-muted/70');
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!show) return; // Skip operation if not shown
      e.stopPropagation();
      hintElement.classList.remove('bg-muted/70');
      scrollToBottom(e as unknown as React.TouchEvent);
    };
    
    hintElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    hintElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      hintElement.removeEventListener('touchstart', handleTouchStart);
      hintElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [show]); // Include show in dependencies to properly react to changes
  
  if (!show) return null;
  
  return (
    <div 
      ref={hintRef}
      className="sticky top-0 z-20 flex justify-center items-center py-3 px-2 text-sm font-medium text-primary bg-white/95 dark:bg-zinc-950/95 cursor-pointer hover:bg-muted/50 active:bg-muted/80 transition-colors rounded-sm shadow-sm border-b"
      onClick={scrollToBottom}
      aria-label="Voir plus de clients"
      role="button"
    >
      <ArrowDown className="h-5 w-5 mr-2 text-primary animate-bounce" />
      <span>Afficher plus de clients</span>
    </div>
  );
};
