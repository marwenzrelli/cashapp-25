
import { useRef } from "react";
import { SelectItem } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useClientListTouchHandlers } from "./useClientListTouchHandlers";
import { ClientListItem } from "./ClientListItem";
import { ScrollHint } from "./ScrollHint";
import { EmptyClientList } from "./EmptyClientList";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling: boolean;
  onClientSelect: (clientId: string) => void;
  onClientRemove?: (clientId: string) => void;
  setOpenState: (open: boolean) => void;
}

export const ClientList = ({
  clients,
  selectedClient,
  isScrolling,
  onClientSelect,
  onClientRemove,
  setOpenState
}: ClientListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  
  // Use our custom touch handlers
  useClientListTouchHandlers(listRef);

  const handleClientClick = (clientId: string, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent event propagation to stop dropdown from closing
    e.preventDefault();
    e.stopPropagation();

    // Ignore clicks during or immediately after scrolling
    if (isScrolling) {
      console.log('Clic ignoré - défilement en cours');
      return;
    }

    // Manual selection handling to prevent auto-closing
    onClientSelect(clientId);
  };

  if (clients.length === 0) {
    return <EmptyClientList />;
  }

  return (
    <div ref={listRef} className="client-list-container overflow-y-auto max-h-[calc(100%-50px)]">
      {/* Visual hint for vertical swiping - only show with more than 5 clients */}
      <ScrollHint show={clients.length > 5} />
      
      <div className="py-0.5">
        {clients.map(client => (
          <ClientListItem 
            key={client.id}
            client={client}
            isSelected={selectedClient === client.id.toString()}
            onClick={handleClientClick}
            onRemove={onClientRemove}
          />
        ))}
      </div>
      
      {/* Small padding at the bottom to ensure last item is fully visible */}
      <div className="h-2" aria-hidden="true"></div>
    </div>
  );
};
