
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
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem 
              key={client.id} 
              value={client.id.toString()}
              disabled={client.id.toString() === disabledValue}
            >
              {client.prenom} {client.nom} ({client.solde} TND)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
