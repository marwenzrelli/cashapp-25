import { useRef, useEffect } from "react";
import { type Client } from "@/features/clients/types";
import { ClientListItem } from "./ClientListItem";
import { ScrollHint } from "./ScrollHint";
import { EmptyClientList } from "./EmptyClientList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling?: boolean;
  onClientSelect: (clientId: string) => void;
  onClientRemove?: (clientId: string) => void;
  setOpenState?: (open: boolean) => void;
}

export const ClientList = ({
  clients,
  selectedClient,
  isScrolling,
  onClientSelect,
  onClientRemove,
  setOpenState
}: ClientListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Filter clients that should be displayed
  const filteredClients = clients;
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollAreaViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      
      if (scrollAreaViewport) {
        // Apply iOS-specific optimizations
        scrollAreaViewport.style.overscrollBehavior = 'contain';
        (scrollAreaViewport.style as any)['-webkit-overflow-scrolling'] = 'touch';
        scrollAreaViewport.style.touchAction = 'pan-y';
        (scrollAreaViewport.style as any)['-webkit-backface-visibility'] = 'hidden';
        
        // Force iOS to recognize this as a scrollable area
        scrollAreaViewport.style.height = '100%';
        scrollAreaViewport.style.position = 'relative';
        
        // Enhanced touch handling for iOS
        let startY = 0;
        let lastY = 0;
        let touchVelocity = 0;
        let startTime = 0;
        let momentum = 0;
        let animationFrame: number | null = null;
        
        const handleTouchStart = (e: TouchEvent) => {
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
          
          // Use more aggressive scrolling for iOS
          scrollAreaViewport.scrollTop += deltaY * 1.5;
          
          const currentTime = Date.now();
          const timeElapsed = currentTime - startTime;
          startTime = currentTime;
          
          if (timeElapsed > 0) {
            touchVelocity = deltaY / timeElapsed;
          }
          
          lastY = currentY;
        };
        
        const handleTouchEnd = () => {
          momentum = touchVelocity * 20; // Increase momentum for better iOS experience
          
          if (Math.abs(momentum) > 0.1) {
            const applyMomentum = () => {
              scrollAreaViewport.scrollTop += momentum * 12;
              
              momentum *= 0.92;
              
              if (Math.abs(momentum) > 0.1) {
                animationFrame = requestAnimationFrame(applyMomentum);
              } else {
                animationFrame = null;
              }
            };
            
            animationFrame = requestAnimationFrame(applyMomentum);
          }
        };
        
        // Add iOS-specific passive listeners for better performance
        scrollAreaViewport.addEventListener('touchstart', handleTouchStart, { passive: true });
        scrollAreaViewport.addEventListener('touchmove', handleTouchMove, { passive: true });
        scrollAreaViewport.addEventListener('touchend', handleTouchEnd, { passive: true });
        
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
    e.preventDefault();
    e.stopPropagation();

    if (isScrolling) {
      console.log('Clic ignoré - défilement en cours');
      return;
    }

    onClientSelect(clientId);
  };

  if (filteredClients.length === 0) {
    return <EmptyClientList />;
  }

  return (
    <div 
      className="client-list-container overflow-hidden relative max-h-[calc(100%-40px)]"
      onClick={(e) => e.stopPropagation()}
    >
      {filteredClients.length > 5 && !isScrolling && (
        <ScrollHint show={filteredClients.length > 5} />
      )}
      
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-[calc(100vh-220px)] max-h-[430px] client-scrollable-area"
        style={{ 
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="py-0.5">
          {filteredClients.map(client => (
            <ClientListItem 
              key={client.id}
              client={client}
              isSelected={selectedClient === client.id.toString()}
              onClick={handleClientClick}
              onRemove={onClientRemove}
            />
          ))}
        </div>
        
        <div className="h-8" aria-hidden="true"></div>
      </ScrollArea>
    </div>
  );
};
