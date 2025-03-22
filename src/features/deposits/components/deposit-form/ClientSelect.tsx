
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import { ClientBalanceDisplay } from "@/features/clients/components/client-list/ClientBalanceDisplay";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";

interface ClientSelectProps {
  clients: ExtendedClient[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  currency: string;
}

export const ClientSelect = ({ 
  clients, 
  selectedClient, 
  setSelectedClient, 
  currency 
}: ClientSelectProps) => {
  const selectedClientData = clients.find(c => c.id.toString() === selectedClient);

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client</Label>
      <Select value={selectedClient} onValueChange={setSelectedClient}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map(client => (
            <SelectItem key={client.id} value={client.id.toString()} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary/50" />
                <span className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20">{client.prenom} {client.nom}</span>
              </div>
              <div className="font-mono text-sm px-2 py-1 rounded-md text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                {client.solde.toLocaleString()} {currency}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedClientData && (
        <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-center justify-between">
          <span className="text-sm">Solde actuel:</span>
          <ClientBalanceDisplay solde={selectedClientData.solde} />
        </div>
      )}
    </div>
  );
};
