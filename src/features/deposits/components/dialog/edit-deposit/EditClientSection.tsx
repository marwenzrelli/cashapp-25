
import React from "react";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { EditFormData } from "@/components/deposits/types";
import { Client } from "@/features/clients/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";

interface EditClientSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  clients: Client[];
}

export const EditClientSection: React.FC<EditClientSectionProps> = ({
  editForm,
  onEditFormChange,
  clients
}) => {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="clientSelect" className="text-base font-medium">Client</Label>
      <Select 
        value={editForm.clientName} 
        onValueChange={(value) => onEditFormChange('clientName', value)}
      >
        <SelectTrigger id="clientSelect" className="relative pl-10 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {clients.map((client) => (
            <SelectItem 
              key={client.id} 
              value={`${client.prenom} ${client.nom}`}
              className="bg-purple-50 dark:bg-purple-900/20 my-1 rounded-md"
            >
              <div className="flex flex-col gap-1">
                <span>{client.prenom} {client.nom}</span>
                <span className={`text-xs ${
                  client.solde >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  Solde: {client.solde.toLocaleString()} {currency}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {editForm.clientBalance && (
        <div className="mt-2 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
          <span className={`text-sm font-medium ${
            parseFloat(editForm.clientBalance) >= 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            Solde actuel: {parseFloat(editForm.clientBalance).toLocaleString()} {currency}
          </span>
        </div>
      )}
    </div>
  );
};
