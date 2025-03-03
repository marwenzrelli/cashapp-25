
import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { ClientSearchInput } from "./client-select/ClientSearchInput";
import { ClientList } from "./client-select/ClientList";
import { useClientFilter } from "./client-select/useClientFilter";
import { useScrollDetection } from "./client-select/useScrollDetection";

interface ClientSelectDropdownProps {
  clients: Client[];
  selectedClient: string;
  onClientSelect: (clientId: string) => void;
}

export const ClientSelectDropdown = ({
  clients,
  selectedClient,
  onClientSelect
}: ClientSelectDropdownProps) => {
  const [openState, setOpenState] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hooks
  const { clientSearch, setClientSearch, filteredClients } = useClientFilter(clients, openState);
  const [isScrolling, clearScrolling] = useScrollDetection(contentRef);

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id.toString() === selectedClient);
    return client ? `${client.prenom} ${client.nom}` : "Sélectionner un client";
  };

  const handleClientSelect = (clientId: string) => {
    onClientSelect(clientId);
    // Close after selection with a slight delay to prevent UI jumps
    setTimeout(() => {
      setOpenState(false);
    }, 100);
  };

  // Setup touch interactions and scrolling behavior
  useEffect(() => {
    if (openState && scrollableAreaRef.current) {
      // Add passive touch listeners for better scrolling
      const scrollElement = scrollableAreaRef.current;
      
      // Set CSS properties directly as strings to avoid TypeScript errors
      scrollElement.style.cssText += 'overscroll-behavior: contain; -webkit-overflow-scrolling: touch;';
      
      // Setup initial scroll position to enable swipe from top
      setTimeout(() => {
        // Initial small scroll to enable momentum scrolling on iOS
        if (scrollElement.scrollTop === 0) {
          scrollElement.scrollTop = 1;
        }
      }, 100);

      // Add touchstart handler to detect initial touch position
      let startY = 0;
      let startTime = 0;
      let isScrollingDown = false;

      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isScrollingDown = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // If moving finger down and content is at the top, start scrolling
        if (deltaY > 5 && scrollElement.scrollTop <= 1) {
          isScrollingDown = true;
          
          // Calculate velocity-based scrolling
          const timeDelta = Date.now() - startTime;
          const velocity = Math.abs(deltaY) / timeDelta;
          
          // Apply scroll based on finger movement and velocity
          const scrollAmount = deltaY * (1 + velocity * 10);
          
          // Apply some resistance at the beginning for natural feel
          const dampenedScroll = Math.min(scrollAmount / 2, 50);
          
          // Smooth scroll based on touch movement
          scrollElement.scrollBy({
            top: dampenedScroll,
            behavior: 'auto'
          });
        }
      };

      scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true });
      
      return () => {
        scrollElement.removeEventListener('touchstart', handleTouchStart);
        scrollElement.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [openState]);

  // Prevent automatic closing from Select component when touching inside our custom content
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (openState && contentRef.current?.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [openState]);

  return (
    <Select 
      value={selectedClient} 
      onValueChange={handleClientSelect} 
      open={openState} 
      onOpenChange={setOpenState}
    >
      <SelectTrigger className="w-full min-h-[42px] touch-manipulation text-zinc-950">
        <SelectValue placeholder="Sélectionner un client">
          {selectedClient ? getSelectedClientName() : "Sélectionner un client"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        className="max-h-[80vh] max-w-[calc(100vw-2rem)] p-0 overflow-hidden" 
        position="popper" 
        sideOffset={5} 
        onEscapeKeyDown={e => {
          e.preventDefault();
          setOpenState(false);
        }} 
        onPointerDownOutside={e => {
          // Completely prevent closing on pointer down outside during scrolling
          if (isScrolling) {
            e.preventDefault();
          }
        }}
      >
        <div 
          ref={contentRef} 
          className="overflow-hidden flex flex-col h-[70vh] max-h-[500px]"
        >
          <ClientSearchInput 
            value={clientSearch} 
            onChange={setClientSearch} 
            isOpen={openState} 
          />
          <div className="text-xs text-muted-foreground px-2 py-2 bg-muted/30 z-10">
            <span>← Glisser fortement vers la gauche pour fermer • {filteredClients.length} clients</span>
          </div>
          <div 
            ref={scrollableAreaRef}
            className="touch-pan-y overflow-y-auto overscroll-contain h-full"
            style={{ overscrollBehavior: 'contain' }}
          >
            <ClientList 
              clients={filteredClients} 
              selectedClient={selectedClient} 
              isScrolling={isScrolling} 
              onClientSelect={handleClientSelect}
              setOpenState={setOpenState}
            />
            <div className="h-24"></div> {/* Extra space at bottom for easier scrolling */}
          </div>
        </div>
      </SelectContent>
    </Select>
  );
};
