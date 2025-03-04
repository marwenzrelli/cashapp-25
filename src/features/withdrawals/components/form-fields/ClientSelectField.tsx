
import React from "react";
import { Label } from "@/components/ui/label";
import { UserCircle, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface ClientSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  clients: ExtendedClient[];
  id?: string;
}

export const ClientSelectField: React.FC<ClientSelectFieldProps> = ({
  value,
  onChange,
  clients,
  id = "clientId"
}) => {
  const { currency } = useCurrency();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-normal">Client</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-12 text-base" id={id}>
          <SelectValue placeholder="Sélectionner un client" />
          <ChevronDown className="h-5 w-5 opacity-50" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem
              key={client.id}
              value={client.id.toString()}
              className="flex items-center justify-between gap-2 py-3"
            >
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary/50" />
                <span>
                  {client.prenom} {client.nom}
                </span>
              </div>
              <span
                className={`font-mono text-sm ${
                  client.solde >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {client.solde.toLocaleString()} {currency}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
