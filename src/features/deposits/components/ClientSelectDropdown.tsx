
import { useState, useEffect } from "react";
import { Search, UserCircle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientSelectDropdownProps {
  clients: Client[];
  selectedClient: string;
  onClientSelect: (clientId: string) => void;
}

export const ClientSelectDropdown = ({
  clients,
  selectedClient,
  onClientSelect
}: ClientSelectDropdownProps) => {
  const { currency } = useCurrency();
  const [clientSearch, setClientSearch] = useState("");
  const [openState, setOpenState] = useState(false);
  
  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client => {
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const searchTerm = clientSearch.toLowerCase();
    return fullName.includes(searchTerm) || client.telephone.includes(searchTerm);
  });

  const handleClientClick = (clientId: string) => {
    // Prevent default to avoid closing the dropdown
    onClientSelect(clientId);
    // Don't close the dropdown immediately on mobile to allow the user to see their selection
    setTimeout(() => setOpenState(false), 300);
  };

  return (
    <Select 
      value={selectedClient} 
      onValueChange={onClientSelect}
      open={openState}
      onOpenChange={setOpenState}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner un client" />
      </SelectTrigger>
      <SelectContent 
        className="max-h-[70vh] overflow-hidden" 
        position="popper"
        sideOffset={5}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOpenState(false);
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          // Only close if not clicking inside the dropdown
          if (!target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-2 sticky top-0 bg-popover z-10 border-b mb-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="pl-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <ScrollArea className="h-[50vh] touch-auto overflow-y-auto overscroll-contain">
          {filteredClients.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground">
              Aucun client trouvé
            </div>
          ) : (
            filteredClients.map((client) => (
              <SelectItem 
                key={client.id} 
                value={client.id.toString()}
                className="flex items-center justify-between py-4 px-2 cursor-pointer touch-manipulation"
                onPointerDown={(e) => {
                  // Prevent default to maintain the dropdown open
                  e.preventDefault();
                  e.stopPropagation();
                  handleClientClick(client.id.toString());
                }}
                onTouchStart={(e) => {
                  // Prevent default touch behavior on mobile
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary/80 flex-shrink-0" />
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
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};
