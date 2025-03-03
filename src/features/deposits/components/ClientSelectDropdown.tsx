
import { useRef, useState } from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Client } from "@/features/clients/types";
import { ClientSearchInput } from "./client-select/ClientSearchInput";
import { ClientList } from "./client-select/ClientList";
import { useClientFilter } from "./client-select/useClientFilter";
import { useScrollDetection } from "./client-select/useScrollDetection";
import { useSwipeToClose } from "./client-select/useSwipeToClose";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hooks
  const { clientSearch, setClientSearch, filteredClients } = useClientFilter(clients, openState);
  const [isScrolling, clearScrolling] = useScrollDetection(scrollAreaRef);
  useSwipeToClose(scrollAreaRef, openState, () => setOpenState(false), isScrolling);

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id.toString() === selectedClient);
    return client ? `${client.prenom} ${client.nom}` : "Sélectionner un client";
  };

  const handleClientSelect = (clientId: string) => {
    onClientSelect(clientId);
    // Close after selection with a slight delay to prevent UI jumps
    setTimeout(() => {
      setOpenState(false);
    }, 50);
  };

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
            return;
          }
          // Prevent closing during interactions inside
          const target = e.target as HTMLElement;
          if (!target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
      >
        <ClientSearchInput 
          value={clientSearch} 
          onChange={setClientSearch} 
          isOpen={openState} 
        />
        <ScrollArea 
          className="h-[60vh] max-h-[450px] touch-auto overflow-y-auto overscroll-contain" 
          ref={scrollAreaRef}
        >
          <div className="text-xs text-muted-foreground px-2 py-2 bg-muted/30 sticky top-0 z-10">
            <span>← Glisser fortement vers la gauche pour fermer • {filteredClients.length} clients</span>
          </div>
          <ClientList 
            clients={filteredClients} 
            selectedClient={selectedClient} 
            isScrolling={isScrolling} 
            onClientSelect={handleClientSelect}
            setOpenState={setOpenState}
          />
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};
