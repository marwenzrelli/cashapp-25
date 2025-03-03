
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
    const scrollArea = contentRef.current?.querySelector('.scrollarea-viewport') as HTMLElement;
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
    if (openState && contentRef.current) {
      const handleContentClick = (e: MouseEvent) => {
        // Prevent event from bubbling up to parent elements
        e.stopPropagation();
      };
      
      contentRef.current.addEventListener('click', handleContentClick);
      
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('click', handleContentClick);
        }
      };
    }
  }, [openState, contentRef]);

  // Set up an effect to ensure the scroll hint works on initial open
  useEffect(() => {
    if (openState) {
      // When the dropdown opens, ensure scroll works
      const handleTouchOnScrollHint = () => {
        const scrollHint = contentRef.current?.querySelector('.client-list-container > div:first-child') as HTMLElement;
        if (scrollHint) {
          scrollHint.addEventListener('click', scrollToBottom, { passive: false });
        }
      };
      
      setTimeout(handleTouchOnScrollHint, 100);
      
      return () => {
        const scrollHint = contentRef.current?.querySelector('.client-list-container > div:first-child') as HTMLElement;
        if (scrollHint) {
          scrollHint.removeEventListener('click', scrollToBottom);
        }
      };
    }
  }, [openState, contentRef]);

  return (
    <SelectContent 
      ref={contentRef} 
      className="client-select-content h-[calc(100vh-200px)] max-h-[500px] w-full p-0 overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      onPointerDownOutside={(e) => {
        // Only close if clicking outside the component, not when interacting within
        if (!contentRef.current?.contains(e.target as Node)) {
          setOpenState(false);
        } else {
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
