
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
          <div className="touch-auto overflow-y-auto overscroll-contain h-full">
            <ClientList 
              clients={filteredClients} 
              selectedClient={selectedClient} 
              isScrolling={isScrolling} 
              onClientSelect={handleClientSelect}
              setOpenState={setOpenState}
            />
            <div className="h-12"></div> {/* Extra space at bottom for easier scrolling */}
          </div>
        </div>
      </SelectContent>
    </Select>
  );
};
