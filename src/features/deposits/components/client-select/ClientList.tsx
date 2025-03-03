
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
  
  // Apply touch optimizations when component mounts
  useEffect(() => {
    if (listRef.current) {
      // Find and optimize all scrollable elements
      const scrollables = listRef.current.querySelectorAll('*');
      scrollables.forEach(el => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const hasScroll = element.scrollHeight > element.clientHeight && 
                        (computedStyle.overflowY === 'auto' || 
                         computedStyle.overflowY === 'scroll');
        
        if (hasScroll) {
          // Apply iOS-style momentum scrolling
          (element.style as any)['-webkit-overflow-scrolling'] = 'touch';
          element.style.touchAction = 'pan-y';
        }
      });
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
          touchAction: 'pan-y'
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
