
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";

interface ExtendedClient extends Client {
  dateCreation: string;
}

interface ClientSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  clients: ExtendedClient[];
  id?: string;
}

// Type for the Supabase real-time payload
interface RealtimePayload {
  new: Record<string, any> | null;
  old: Record<string, any> | null;
  eventType: string;
  [key: string]: any;
}

export const ClientSelectField: React.FC<ClientSelectFieldProps> = ({
  value,
  onChange,
  clients,
  id = "clientId"
}) => {
  const { currency } = useCurrency();
  const [realTimeBalances, setRealTimeBalances] = useState<Record<string, number>>({});
  
  // Subscribe to real-time updates for client balances
  useEffect(() => {
    // Initialize with current balances
    const initialBalances: Record<string, number> = {};
    clients.forEach(client => {
      initialBalances[client.id.toString()] = client.solde;
    });
    setRealTimeBalances(initialBalances);
    
    // Set up real-time subscription for balance updates
    const channel = supabase
      .channel('client-balance-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clients' },
        (payload: RealtimePayload) => {
          if (
            payload.new && 
            typeof payload.new === 'object' &&
            'id' in payload.new && 
            'solde' in payload.new &&
            payload.new.id !== null &&
            payload.new.solde !== null
          ) {
            setRealTimeBalances(prev => ({
              ...prev,
              [payload.new.id]: payload.new.solde
            }));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clients]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Client</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" id={id}>
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem
              key={client.id}
              value={client.id.toString()}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary/50" />
                <span>
                  {client.prenom} {client.nom}
                </span>
              </div>
              <span
                className={`font-mono text-sm ${
                  (realTimeBalances[client.id.toString()] ?? client.solde) >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {(realTimeBalances[client.id.toString()] ?? client.solde).toLocaleString()} {currency}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
