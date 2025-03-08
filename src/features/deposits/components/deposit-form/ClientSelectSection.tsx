
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle } from "lucide-react";
import { ClientBalanceDisplay } from "@/features/clients/components/client-list/ClientBalanceDisplay";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";

interface ClientSelectSectionProps {
  clients: ExtendedClient[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  selectedClientData: ExtendedClient | undefined;
}

export const ClientSelectSection = ({
  clients,
  selectedClient,
  setSelectedClient,
  selectedClientData
}: ClientSelectSectionProps) => {
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
                <span>{client.prenom} {client.nom}</span>
              </div>
              <div className={`font-mono text-sm ${
                client.solde >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {client.solde.toLocaleString()} {/* Currency will be provided by context */}
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
