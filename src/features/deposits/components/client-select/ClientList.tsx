
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
  const {
    currency
  } = useCurrency();

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

  return <>
      {clients.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Aucun client trouvé
        </div>
      ) : (
        <>
          {/* Visual hint for vertical swiping - only show with more than 5 clients */}
          {clients.length > 5 && (
            <div className="flex justify-center items-center py-2 text-xs text-muted-foreground animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <span>Glisser vers le bas pour faire défiler</span>
            </div>
          )}
          
          {clients.map(client => (
            <div 
              key={client.id} 
              onClick={e => handleClientClick(client.id.toString(), e)} 
              onTouchEnd={e => {
                // Only handle touch if it wasn't a scroll
                if (!isScrolling) {
                  handleClientClick(client.id.toString(), e);
                }
              }} 
              data-client-id={client.id.toString()} 
              className="rounded-lg my-[10px] mx-[10px]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-10 w-10 text-primary/80 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-base">
                      {client.prenom} {client.nom}
                    </span>
                  </div>
                </div>
                <span className={`font-mono text-lg font-semibold ${client.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {client.solde.toLocaleString()} {currency}
                </span>
              </div>
              
              {/* Hidden SelectItem to maintain the Select's value state */}
              <SelectItem value={client.id.toString()} className="sr-only" />
            </div>
          ))}
        </>
      )}
    </>;
};
