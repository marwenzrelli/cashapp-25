
import { Button } from "@/components/ui/button";
import { Client } from "../../types";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientExpandedViewProps {
  client: Client;
  onView: (clientId: number) => void;
}

export const ClientExpandedView = ({ client, onView }: ClientExpandedViewProps) => {
  const { currency } = useCurrency();
  
  const clientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;
  const clientName = `${client.prenom} ${client.nom}`;
  
  // Use database balance directly (calculated server-side via triggers)
  const roundedBalance = Math.round(client.solde * 100) / 100; // Round to 2 decimal places
  
  return (
    <div className="mt-4 md:pl-14 text-sm grid gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-muted-foreground text-xs">Email</p>
          <p className="truncate font-medium">{client.email || "Non renseigné"}</p>
        </div>
        <div className="bg-white dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">Solde net</p>
          <div>
            <span className={`px-2 py-1 inline-block border rounded-md ${
              roundedBalance >= 0 
                ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400' 
                : 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400'
            }`}>
              {Math.abs(roundedBalance).toLocaleString('fr-FR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 2 
              })} {currency}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-muted-foreground text-xs">Date de création</p>
          <p className="font-medium">{format(new Date(client.date_creation || ''), "dd/MM/yyyy")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800/60 rounded-lg p-3">
          <p className="text-muted-foreground text-xs">Dernière mise à jour</p>
          <p className="font-medium">{format(new Date(), "dd/MM/yyyy")}</p>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(client.id)}
          className="hover:bg-primary/5"
        >
          Voir le profil complet
        </Button>
      </div>
    </div>
  );
};
