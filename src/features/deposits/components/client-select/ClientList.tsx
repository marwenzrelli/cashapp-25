
import { useRef, useEffect } from "react";
import { type Client } from "@/features/clients/types";
import { ClientListItem } from "./ClientListItem";
import { ScrollHint } from "./ScrollHint";
import { EmptyClientList } from "./EmptyClientList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling: boolean;
  onClientSelect: (clientId: string) => void;
  onClientRemove?: (clientId: string) => void;
  setOpenState: (open: boolean) => void;
}

export const ClientList = ({
  clients,
  selectedClient,
  isScrolling,
  onClientSelect,
  onClientRemove,
  setOpenState
}: ClientListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Enhanced touch optimization when component mounts
  useEffect(() => {
    if (listRef.current) {
      // Find the ScrollArea viewport element
      const scrollAreaViewport = listRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      
      if (scrollAreaViewport) {
        // Apply iOS-style momentum scrolling
        scrollAreaViewport.style.overscrollBehavior = 'contain';
        (scrollAreaViewport.style as any)['-webkit-overflow-scrolling'] = 'touch';
        scrollAreaViewport.style.touchAction = 'pan-y';
        
        // Add direct touch event listeners for better control
        let startY = 0;
        let lastY = 0;
        let touchVelocity = 0;
        let startTime = 0;
        let momentum = 0;
        let animationFrame: number | null = null;
        
        const handleTouchStart = (e: TouchEvent) => {
          // Cancel any ongoing momentum animation
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
          }
          
          startY = e.touches[0].clientY;
          lastY = startY;
          startTime = Date.now();
          touchVelocity = 0;
          momentum = 0;
        };
        
        const handleTouchMove = (e: TouchEvent) => {
          const currentY = e.touches[0].clientY;
          const deltaY = lastY - currentY;
          
          // Apply small amplification factor for more responsive feel
          scrollAreaViewport.scrollTop += deltaY * 1.2;
          
          // Calculate velocity (pixels per ms)
          const currentTime = Date.now();
          const timeElapsed = currentTime - startTime;
          startTime = currentTime;
          
          if (timeElapsed > 0) {
            touchVelocity = deltaY / timeElapsed;
          }
          
          lastY = currentY;
        };
        
        const handleTouchEnd = () => {
          // Apply momentum based on final velocity
          momentum = touchVelocity * 15; // Amplify for better feel
          
          if (Math.abs(momentum) > 0.1) {
            const applyMomentum = () => {
              scrollAreaViewport.scrollTop += momentum * 10;
              
              // Apply friction to gradually slow down
              momentum *= 0.95;
              
              if (Math.abs(momentum) > 0.1) {
                animationFrame = requestAnimationFrame(applyMomentum);
              } else {
                animationFrame = null;
              }
            };
            
            animationFrame = requestAnimationFrame(applyMomentum);
          }
        };
        
        // Add event listeners with passive true for performance
        scrollAreaViewport.addEventListener('touchstart', handleTouchStart, { passive: true });
        scrollAreaViewport.addEventListener('touchmove', handleTouchMove, { passive: true });
        scrollAreaViewport.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Cleanup function
        return () => {
          scrollAreaViewport.removeEventListener('touchstart', handleTouchStart);
          scrollAreaViewport.removeEventListener('touchmove', handleTouchMove);
          scrollAreaViewport.removeEventListener('touchend', handleTouchEnd);
          
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
        };
      }
    }
  }, []);

  const handleClientClick = (clientId: string, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event propagation to stop dropdown from closing
    e.preventDefault();
    e.stopPropagation();

    // Ignore clicks during or immediately after scrolling
    if (isScrolling) {
      console.log('Clic ignoré - défilement en cours');
      return;
    }

    // Manual selection handling to prevent auto-closing
    onClientSelect(clientId);
  };

  if (clients.length === 0) {
    return <EmptyClientList />;
  }

  return (
    <div 
      ref={listRef} 
      className="client-list-container overflow-hidden max-h-[calc(100%-40px)]"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up and closing dropdown
    >
      {/* Visual hint for vertical swiping - only show with more than 5 clients */}
      <ScrollHint show={clients.length > 5} />
      
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-[calc(100vh-220px)] max-h-[430px] client-scrollable-area"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="py-0.5">
          {clients.map(client => (
            <ClientListItem 
              key={client.id}
              client={client}
              isSelected={selectedClient === client.id.toString()}
              onClick={handleClientClick}
              onRemove={onClientRemove}
            />
          ))}
        </div>
        
        {/* Extra padding at the bottom to allow scrolling to see the last items */}
        <div className="h-8" aria-hidden="true"></div>
      </ScrollArea>
    </div>
  );
};
