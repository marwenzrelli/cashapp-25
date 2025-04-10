
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Client {
  id: string | number;
  prenom: string;
  nom: string;
  solde: number;
}

interface ClientSelectProps {
  clients: Client[];
  selectedClient: string;
  onClientChange: (value: string) => void;
  label?: string;
  currency: string;
}

export const ClientSelect = ({
  clients,
  selectedClient,
  onClientChange,
  label = "Client",
  currency
}: ClientSelectProps) => {
  // Find the selected client to display their balance
  const selectedClientData = clients.find(client => client.id.toString() === selectedClient);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="client">{label}</Label>
      <Select value={selectedClient} onValueChange={onClientChange}>
        <SelectTrigger id="client" className="w-full">
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id.toString()} className="flex flex-col py-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary/50" />
                <span className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20">
                  {client.prenom} {client.nom}
                </span>
              </div>
              <div className="pl-6 mt-1">
                <span className={`font-mono text-sm px-2 py-1 rounded-md ${
                  client.solde >= 0 
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                }`}>
                  Solde: {client.solde.toLocaleString()} {currency}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedClientData && (
        <div className="mt-2 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
          <span className={`text-sm font-medium ${
            selectedClientData.solde >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            Solde actuel: {selectedClientData.solde.toLocaleString()} {currency}
          </span>
        </div>
      )}
    </div>
  );
};
