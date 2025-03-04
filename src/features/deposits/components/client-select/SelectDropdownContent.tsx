
import { RefObject } from "react";
import { SelectContent } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client } from "@/features/clients/types";
import { ClientList } from "./ClientList";
import { ClientSearchInput } from "./ClientSearchInput";
import { EmptyClientList } from "./EmptyClientList";
import { ScrollHint } from "./ScrollHint";

interface SelectDropdownContentProps {
  openState: boolean;
  setOpenState: (open: boolean) => void;
  isScrolling: boolean;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  filteredClients: Client[];
  selectedClient: string;
  onClientSelect: (clientId: string) => void;
  contentRef: RefObject<HTMLDivElement>;
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
  const handlePointerDownOutside = (e: any) => {
    // If we're scrolling, prevent closing
    if (isScrolling) {
      e.preventDefault();
      return;
    }
  };

  const hasNoResults = clientSearch.length > 0 && filteredClients.length === 0;
  const showScrollHint = filteredClients.length > 5 && !isScrolling;

  return (
    <SelectContent
      ref={contentRef}
      className="max-h-[60vh] overflow-hidden p-0"
      style={{ touchAction: "pan-y" }}
      onPointerDownOutside={handlePointerDownOutside}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b p-2">
        <ClientSearchInput
          value={clientSearch}
          onChange={setClientSearch}
          isScrolling={isScrolling}
        />
      </div>

      <ScrollArea className="max-h-[50vh] overflow-y-auto px-1 pt-1 pb-2">
        {hasNoResults ? (
          <EmptyClientList searchTerm={clientSearch} />
        ) : (
          <ClientList
            clients={filteredClients}
            selectedClient={selectedClient}
            onClientSelect={onClientSelect}
            isScrolling={isScrolling}
            setOpenState={setOpenState}
          />
        )}
      </ScrollArea>

      {showScrollHint && <ScrollHint show={showScrollHint} />}
    </SelectContent>
  );
};
