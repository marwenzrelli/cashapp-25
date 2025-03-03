
import { useRef } from "react";
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

  return (
    <Select 
      value={selectedClient} 
      onValueChange={handleClientSelect} 
      open={openState} 
      onOpenChange={setOpenState}
    >
      <SelectTrigger className="w-full min-h-[42px] py-3 px-4 bg-white dark:bg-black shadow-sm rounded-lg border-input text-zinc-950 dark:text-zinc-50 font-medium touch-manipulation">
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

// We need to import useState at the top
import { useState } from "react";
