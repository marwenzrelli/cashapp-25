
import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TransferClientSelectProps {
  id: string;
  label: string;
  clients: Client[];
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  placeholder: string;
  disabledValue?: string;
}

export const TransferClientSelect = ({
  id,
  label,
  clients,
  value,
  onChange,
  placeholder,
  disabledValue,
}: TransferClientSelectProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {clients.map((client) => (
            <SelectItem 
              key={client.id} 
              value={client.id.toString()}
              disabled={client.id.toString() === disabledValue}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {client.prenom} {client.nom}
                </span>
                <span className={`text-xs ${
                  client.solde >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Solde: {client.solde.toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })} {currency}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {id === 'fromClient' ? 'Compte qui envoie les fonds' : 'Compte qui reçoit les fonds'}
      </p>
    </div>
  );
};
