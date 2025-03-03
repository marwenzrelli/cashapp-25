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
      {clients.length === 0 ? <div className="p-4 text-center text-muted-foreground">
          Aucun client trouvé
        </div> : clients.map(client => <div key={client.id} onClick={e => handleClientClick(client.id.toString(), e)} onTouchEnd={e => {
      // Only handle touch if it wasn't a scroll
      if (!isScrolling) {
        handleClientClick(client.id.toString(), e);
      }
    }} data-client-id={client.id.toString()} className="my-[10px] mx-[10px] rounded">
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
            
            {/* Hidden SelectItem to maintain the Select's value state */}
            <SelectItem value={client.id.toString()} className="sr-only" />
          </div>)}
    </>;
};