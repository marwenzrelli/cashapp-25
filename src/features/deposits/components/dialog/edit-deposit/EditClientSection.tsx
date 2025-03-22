
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
              {client.prenom} {client.nom}
              {client.solde < 0 && (
                <span className="ml-2 text-red-500">
                  {client.solde.toLocaleString()} {currency}
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {editForm.clientBalance && (
        <p className="text-sm text-red-500">{editForm.clientBalance} {currency}</p>
      )}
    </div>
  );
};
