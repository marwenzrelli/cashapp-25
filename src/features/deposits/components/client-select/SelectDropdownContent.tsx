import React from "react";
import { SelectContent } from "@/components/ui/select";
import { ClientSearchInput } from "./ClientSearchInput";
import { ClientList } from "./ClientList";
import { type Client } from "@/features/clients/types";

interface SelectDropdownContentProps {
  openState: boolean;
  setOpenState: (open: boolean) => void;
  isScrolling: boolean;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  filteredClients: Client[];
  selectedClient: string;
  onClientSelect: (clientId: string) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const SelectDropdownContent = ({
  openState,
  setOpenState,
  isScrolling,
  clientSearch,
  setClientSearch,
  filteredClients,
  selectedClient,
  onClientSelect,
  contentRef
}: SelectDropdownContentProps) => {

  const handleClientRemove = (clientId: string) => {
    // Clearing the selection
    onClientSelect("");
    
    // Close the dropdown after a short delay
    setTimeout(() => {
      setOpenState(false);
    }, 300);
  };

  return (
    <SelectContent 
      ref={contentRef} 
      className="client-select-content h-80 w-full p-0 overflow-hidden"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950 pt-1 px-4 pb-2">
        <ClientSearchInput 
          value={clientSearch} 
          onChange={setClientSearch} 
          count={filteredClients.length}
        />
      </div>
      
      <ClientList 
        clients={filteredClients}
        selectedClient={selectedClient}
        isScrolling={isScrolling}
        onClientSelect={onClientSelect}
        onClientRemove={handleClientRemove}
        setOpenState={setOpenState}
      />
    </SelectContent>
  );
};
