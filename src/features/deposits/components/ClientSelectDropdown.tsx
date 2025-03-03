
import { useState, useEffect, useRef } from "react";
import { Search, UserCircle } from "lucide-react";
import Hammer from "hammerjs";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client => {
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const searchTerm = clientSearch.toLowerCase();
    return fullName.includes(searchTerm) || client.telephone.includes(searchTerm);
  });

  // Focus sur le champ de recherche lorsque le dropdown est ouvert
  useEffect(() => {
    if (openState && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [openState]);
  
  // Configuration de Hammer.js pour les gestes tactiles
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    
    if (scrollArea && openState) {
      const hammer = new Hammer(scrollArea);
      
      // Configuration pour détecter les swipes horizontaux
      hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      
      // Gestionnaire de swipe
      hammer.on('swipe', (e) => {
        // Swipe vers la gauche (pour fermer le dropdown)
        if (e.direction === Hammer.DIRECTION_LEFT) {
          console.log('Swipe à gauche détecté');
          setOpenState(false);
        }
        
        // Swipe vers la droite (pour une action alternative si nécessaire)
        if (e.direction === Hammer.DIRECTION_RIGHT) {
          console.log('Swipe à droite détecté');
          // Vous pouvez ajouter une action différente ici si nécessaire
        }
      });
      
      // Nettoyage des événements Hammer au démontage
      return () => {
        hammer.destroy();
      };
    }
  }, [openState]);

  const handleClientClick = (clientId: string) => {
    onClientSelect(clientId);
    // Vibration tactile légère si supportée (pour les appareils modernes)
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20); // vibration de 20ms
    }
    // Fermer le dropdown après un délai pour montrer la sélection à l'utilisateur
    setTimeout(() => setOpenState(false), 300);
  };

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id.toString() === selectedClient);
    return client ? `${client.prenom} ${client.nom}` : "Sélectionner un client";
  };

  return (
    <Select 
      value={selectedClient} 
      onValueChange={onClientSelect}
      open={openState}
      onOpenChange={setOpenState}
    >
      <SelectTrigger className="w-full min-h-[42px] touch-manipulation">
        <SelectValue placeholder="Sélectionner un client">
          {selectedClient ? getSelectedClientName() : "Sélectionner un client"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        className="max-h-[70vh] max-w-[calc(100vw-2rem)] p-0 overflow-hidden" 
        position="popper"
        sideOffset={5}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOpenState(false);
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          // Ne fermer que si on ne clique pas à l'intérieur du dropdown
          if (!target.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="p-2 sticky top-0 bg-popover z-10 border-b mb-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Rechercher un client..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="pl-8"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              autoComplete="off"
            />
          </div>
        </div>
        <ScrollArea 
          className="h-[50vh] max-h-[300px] touch-auto overflow-y-auto overscroll-contain"
          ref={scrollAreaRef}
        >
          <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/30">
            <span>← Glisser vers la gauche pour fermer</span>
          </div>
          {filteredClients.length === 0 ? (
            <div className="p-2 text-center text-muted-foreground">
              Aucun client trouvé
            </div>
          ) : (
            filteredClients.map((client) => (
              <SelectItem 
                key={client.id} 
                value={client.id.toString()}
                className="flex items-center justify-between py-4 px-2 cursor-pointer touch-manipulation select-none active:bg-primary/10"
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
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClientClick(client.id.toString());
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

