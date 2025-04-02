
import { RefObject, useEffect } from "react";
import { SelectContent } from "@/components/ui/select";
import { Client } from "@/features/clients/types";
import { ClientList } from "./ClientList";
import { ClientSearchInput } from "./ClientSearchInput";
import { EmptyClientList } from "./EmptyClientList";

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
  // Force iOS redraw on component mount
  useEffect(() => {
    if (contentRef.current) {
      // Force iOS to recalculate and display the content
      const forceIOSRedraw = () => {
        if (contentRef.current) {
          // Get viewport element
          const viewport = contentRef.current.querySelector('[data-radix-select-viewport]');
          if (viewport) {
            // Force repaint by toggling a style
            (viewport as HTMLElement).style.display = 'none';
            setTimeout(() => {
              if (viewport) {
                (viewport as HTMLElement).style.display = '';
              }
            }, 10);
          }
        }
      };
      
      // Apply on mount with slight delay to ensure DOM is ready
      setTimeout(forceIOSRedraw, 50);
    }
  }, [contentRef, openState]);

  const handlePointerDownOutside = (e: any) => {
    // Never prevent pointer events to improve interaction
    return false;
  };

  const hasNoResults = clientSearch.length > 0 && filteredClients.length === 0;

  return (
    <SelectContent
      ref={contentRef}
      className="max-h-[60vh] overflow-hidden p-0 ios-select-content"
      style={{ 
        touchAction: "pan-y",
        // Use string indexing for vendor prefixed property
        ...(typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? 
          { ['-webkit-overflow-scrolling']: 'touch' } : {})
      }}
      onPointerDownOutside={handlePointerDownOutside}
      onCloseAutoFocus={(e) => {
        // Prevent auto focus which can cause problems on iOS
        e.preventDefault();
      }}
      position="popper"
      sideOffset={0}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b p-2">
        <ClientSearchInput
          value={clientSearch}
          onChange={setClientSearch}
          isOpen={openState}
          count={filteredClients.length}
          isScrolling={isScrolling}
        />
      </div>

      {hasNoResults ? (
        <EmptyClientList searchTerm={clientSearch} />
      ) : (
        <ClientList
          clients={filteredClients}
          selectedClient={selectedClient}
          onClientSelect={onClientSelect}
          isScrolling={false} // Toujours permettre les interactions, ne jamais bloquer
          setOpenState={setOpenState}
        />
      )}
    </SelectContent>
  );
};
