
import { useRef, useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useClientFilter } from "./client-select/useClientFilter";
import { useScrollDetection } from "./client-select/useScrollDetection";
import { SelectDropdownContent } from "./client-select/SelectDropdownContent";

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
  const [forceSelection, setForceSelection] = useState(false);
  
  // Use our custom hooks
  const { clientSearch, setClientSearch, filteredClients } = useClientFilter(clients, openState);
  const [isScrolling, clearScrolling] = useScrollDetection(contentRef);

  // Force iOS redraw on open/close state change
  useEffect(() => {
    if (openState) {
      // Force iOS to display content with a slight delay
      const timeout = setTimeout(() => {
        if (contentRef.current) {
          // Toggle a property to force redraw
          contentRef.current.style.opacity = '0.99';
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.style.opacity = '1';
            }
          }, 10);
        }
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [openState]);

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id.toString() === selectedClient);
    return client ? `${client.prenom} ${client.nom}` : "Sélectionner un client";
  };

  const handleClientSelect = (clientId: string) => {
    // Check if this is a real selection vs a clear operation
    if (clientId) {
      onClientSelect(clientId);
      // On iOS, we need a slight delay to ensure UI updates properly
      setTimeout(() => {
        setOpenState(false);
      }, 100);
    } else if (clientId === "") {
      onClientSelect("");
      setOpenState(false);
    }
  };

  // Handle iOS-specific touchend issues
  const handleTriggerTouch = () => {
    // This helps iOS recognize the dropdown should open on touch
    if (!openState) {
      setOpenState(true);
    }
  };

  return (
    <Select 
      value={selectedClient} 
      onValueChange={handleClientSelect} 
      open={openState} 
      onOpenChange={setOpenState}
    >
      <SelectTrigger 
        className="w-full min-h-[42px] py-3 px-4 bg-white dark:bg-black shadow-sm rounded-lg border-input text-zinc-950 dark:text-zinc-50 font-medium touch-manipulation"
        onTouchEnd={handleTriggerTouch}
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
        }}
      >
        <SelectValue placeholder="Sélectionner un client">
          {selectedClient ? getSelectedClientName() : "Sélectionner un client"}
        </SelectValue>
      </SelectTrigger>
      
      <SelectDropdownContent
        openState={openState}
        setOpenState={setOpenState}
        isScrolling={isScrolling}
        clientSearch={clientSearch}
        setClientSearch={setClientSearch}
        filteredClients={filteredClients}
        selectedClient={selectedClient}
        onClientSelect={handleClientSelect}
        contentRef={contentRef}
      />
    </Select>
  );
};
