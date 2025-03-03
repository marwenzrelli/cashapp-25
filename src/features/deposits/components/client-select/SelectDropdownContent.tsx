
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
      console.log('SelectDropdownContent: scrolling to bottom via ScrollArea');
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }
    
    // Fallback to any scrollable element in the content
    const scrollableElements = contentRef.current?.querySelectorAll('*');
    if (scrollableElements) {
      scrollableElements.forEach(el => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const hasScroll = element.scrollHeight > element.clientHeight && 
                        (computedStyle.overflowY === 'auto' || 
                         computedStyle.overflowY === 'scroll');
        
        if (hasScroll) {
          console.log('SelectDropdownContent: found scrollable element', element);
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        }
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

  // Set up an effect to manually hook up the scroll hint
  useEffect(() => {
    if (openState) {
      // When the dropdown opens, ensure the scroll hint works
      const scrollTimeout = setTimeout(() => {
        // Try to find the ScrollHint component
        const scrollHint = contentRef.current?.querySelector('.client-list-container > div:first-child');
        if (scrollHint) {
          scrollHint.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollToBottom();
          });
        }
      }, 100);
      
      return () => {
        clearTimeout(scrollTimeout);
      };
    }
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
