
import React, { useEffect } from "react";
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

  // Function to scroll to the bottom of the list
  const scrollToBottom = () => {
    // Find the Radix UI ScrollArea viewport
    const scrollArea = contentRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleClientRemove = (clientId: string) => {
    // Clearing the selection
    onClientSelect("");
    
    // Close the dropdown after a short delay
    setTimeout(() => {
      setOpenState(false);
    }, 300);
  };

  // Prevent dropdown from closing when clicking inside
  useEffect(() => {
    if (!openState || !contentRef.current) return;
    
    const currentRef = contentRef.current;
    
    // Handler for content clicks
    const handleContentClick = (e: MouseEvent) => {
      e.stopPropagation();
    };
    
    // Set up both handlers
    currentRef.addEventListener('click', handleContentClick);
    
    // Clean up all event listeners on unmount
    return () => {
      currentRef.removeEventListener('click', handleContentClick);
    };
  }, [openState, contentRef]);

  return (
    <SelectContent 
      ref={contentRef} 
      className="client-select-content h-[calc(100vh-200px)] max-h-[500px] w-full p-0 overflow-hidden bg-white dark:bg-zinc-950"
      style={{ touchAction: 'pan-y' }}
      onPointerDownOutside={(e) => {
        // Only close if clicking outside the component, not when interacting within
        if (!contentRef.current?.contains(e.target as Node)) {
          setOpenState(false);
        } else {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        // Prevent interactions outside from closing when interacting with the dropdown
        if (contentRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      }}
    >
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950 pt-0.5 px-2 pb-0.5">
        <ClientSearchInput 
          value={clientSearch} 
          onChange={setClientSearch} 
          count={filteredClients.length}
          isOpen={openState}
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
