
import { useRef } from "react";
import { SelectContent } from "@/components/ui/select";
import { ClientSearchInput } from "./ClientSearchInput";
import { ClientList } from "./ClientList";
import { useScrollDetection } from "./useScrollDetection";
import { useDropdownTouchInteractions } from "./useDropdownTouchInteractions";
import { TouchPropagationHandler } from "./TouchPropagationHandler";
import { type Client } from "@/features/clients/types";

interface SelectDropdownContentProps {
  openState: boolean;
  setOpenState: (open: boolean) => void;
  isScrolling: boolean;
  clientSearch: string;
  setClientSearch: (value: string) => void;
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
  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  
  // Use the touch interaction hook
  useDropdownTouchInteractions(scrollableAreaRef, {
    openState,
    onClose: () => setOpenState(false)
  });

  return (
    <>
      <TouchPropagationHandler contentRef={contentRef} openState={openState} />
      
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
          <div className="text-xs text-muted-foreground px-2 py-2 bg-muted/30 z-10 sticky top-0">
            <span>{filteredClients.length} clients</span>
          </div>
          <div 
            ref={scrollableAreaRef}
            className="touch-pan-y overflow-y-auto overscroll-contain h-full"
            style={{ 
              overscrollBehavior: 'contain'
            }}
          >
            <ClientList 
              clients={filteredClients} 
              selectedClient={selectedClient} 
              isScrolling={isScrolling} 
              onClientSelect={onClientSelect}
              setOpenState={setOpenState}
            />
          </div>
        </div>
      </SelectContent>
    </>
  );
};
