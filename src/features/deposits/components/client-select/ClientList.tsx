
import { UserCircle } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientListProps {
  clients: Client[];
  selectedClient: string;
  isScrolling: boolean;
  onClientSelect: (clientId: string) => void;
}

export const ClientList = ({ 
  clients, 
  selectedClient, 
  isScrolling, 
  onClientSelect 
}: ClientListProps) => {
  const { currency } = useCurrency();

  const handleClientClick = (clientId: string) => {
    // Ignore clicks during or immediately after scrolling
    if (isScrolling) {
      console.log('Clic ignoré - défilement en cours');
      return;
    }
    
    onClientSelect(clientId);
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  };

  return (
    <>
      {clients.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Aucun client trouvé
        </div>
      ) : (
        clients.map(client => (
          <SelectItem
            key={client.id}
            value={client.id.toString()}
            className="flex items-center justify-between py-5 px-3 cursor-pointer touch-manipulation select-none active:bg-primary/10"
            onPointerDown={e => {
              // Ignore clicks during scrolling
              if (isScrolling) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              handleClientClick(client.id.toString());
            }}
            // Better touch event handling
            onTouchStart={e => {
              e.stopPropagation();
            }}
            onTouchEnd={e => {
              // Ignore touch events during scrolling
              if (isScrolling) {
                console.log('Toucher final ignoré - défilement en cours');
                return;
              }
              
              if (!e.currentTarget.contains(e.target as Node)) return;
              
              e.preventDefault();
              e.stopPropagation();
              handleClientClick(client.id.toString());
            }}
            // Prevent dropdown closing during scroll
            onTouchMove={e => e.stopPropagation()}
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
          </SelectItem>
        ))
      )}
      <div className="h-12"></div> {/* Extra space at bottom for easier scrolling */}
    </>
  );
};
