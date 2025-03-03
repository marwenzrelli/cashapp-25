
import { UserCircle } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling: boolean;
  onClientSelect: (clientId: string) => void;
  setOpenState: (open: boolean) => void;
}

export const ClientList = ({ 
  clients, 
  selectedClient, 
  isScrolling, 
  onClientSelect,
  setOpenState
}: ClientListProps) => {
  const { currency } = useCurrency();

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

  return (
    <>
      {clients.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Aucun client trouvé
        </div>
      ) : (
        clients.map(client => (
          <div
            key={client.id}
            className="flex items-center justify-between py-5 px-3 cursor-pointer touch-manipulation select-none hover:bg-accent"
            onClick={(e) => handleClientClick(client.id.toString(), e)}
            onTouchEnd={(e) => {
              // Only handle touch if it wasn't a scroll
              if (!isScrolling) {
                handleClientClick(client.id.toString(), e);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary/80 flex-shrink-0" />
              <span className="font-medium">
                {client.prenom} {client.nom}
              </span>
            </div>
            <span className={`font-mono text-sm ${client.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {client.solde.toLocaleString()} {currency}
            </span>
            
            {/* Hidden SelectItem to maintain the Select's value state */}
            <SelectItem
              value={client.id.toString()}
              className="sr-only"
            />
          </div>
        ))
      )}
      <div className="h-12"></div> {/* Extra space at bottom for easier scrolling */}
    </>
  );
};
