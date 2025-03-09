
import { Button } from "@/components/ui/button";
import { Client } from "../../types";

interface ClientExpandedViewProps {
  client: Client;
  onView: (clientId: number) => void;
}

export const ClientExpandedView = ({ client, onView }: ClientExpandedViewProps) => {
  return (
    <div className="mt-4 md:pl-14 text-sm grid gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="truncate">{client.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Solde</p>
          <div>
            <span className={`text-left px-2 py-1 inline-block border border-gray-200 rounded-md ${client.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {client.solde.toLocaleString()} TND
            </span>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground">Date de création</p>
          <p>{new Date(client.date_creation || '').toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Dernière mise à jour</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView(client.id)}
        >
          Voir le profil complet
        </Button>
      </div>
    </div>
  );
};
