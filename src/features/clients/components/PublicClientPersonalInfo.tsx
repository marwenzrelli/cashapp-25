
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ClientIdBadge } from "./ClientIdBadge";
import { User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PublicClientPersonalInfoProps {
  client: Client;
  operations?: any[]; // Add operations prop to calculate net balance
}

export const PublicClientPersonalInfo = ({
  client,
  operations = []
}: PublicClientPersonalInfoProps) => {
  const { formatCurrency } = useCurrency();

  // Calculate the effective balance exactly like in the main profile page
  // This should match the calculation used in PersonalInfoFields
  const calculateEffectiveBalance = () => {
    if (operations && operations.length > 0) {
      let balance = 0;
      
      operations.forEach(op => {
        if (op.type === "deposit") {
          balance += Number(op.amount);
        } else if (op.type === "withdrawal") {
          balance -= Number(op.amount);
        } else if (op.type === "transfer") {
          // Check if this client is sender or receiver
          const clientFullName = `${client.prenom} ${client.nom}`.toLowerCase();
          if (op.to_client && op.to_client.toLowerCase() === clientFullName) {
            balance += Number(op.amount); // Receiving transfer
          } else if (op.from_client && op.from_client.toLowerCase() === clientFullName) {
            balance -= Number(op.amount); // Sending transfer
          }
        }
      });
      
      return balance;
    }
    
    return client.solde;
  };

  const effectiveBalance = calculateEffectiveBalance();
  
  // Use simple formatting without any separators, exactly like the main profile
  const formattedBalance = `${Math.round(effectiveBalance)} TND`;
  
  return <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 w-full rounded-lg border">
      <CardHeader className="pb-4 space-y-0">
        <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-base sm:text-lg">Informations personnelles</span>
          <ClientIdBadge clientId={client.id} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Client name and avatar */}
          <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{client.prenom} {client.nom}</h3>
              <p className="text-xs text-muted-foreground">Client vérifié</p>
            </div>
          </div>

          {/* Contact info - Hidden on mobile */}
          <div className="grid grid-cols-1 gap-3 hidden md:grid">
            
          </div>

          {/* Creation date - Hidden on mobile */}
          <div className="grid grid-cols-1 gap-3 hidden md:grid">
            
          </div>

          {/* Balance section */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-lg">
              <Wallet className="h-4 w-4 text-primary/70" />
              <div className="w-full">
                <p className="text-xs text-muted-foreground">Solde net</p>
                <span className={cn("text-lg font-semibold inline-block mt-0.5", effectiveBalance >= 0 ? "text-green-600" : "text-red-600")}>
                  {formattedBalance}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
