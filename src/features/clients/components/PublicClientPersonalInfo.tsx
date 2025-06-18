
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
    console.log("PublicClientPersonalInfo - Calculating balance for:", client.prenom, client.nom);
    console.log("PublicClientPersonalInfo - Operations count:", operations.length);
    console.log("PublicClientPersonalInfo - Client solde from DB:", client.solde);
    
    if (operations && operations.length > 0) {
      let balance = 0;
      const clientFullName = `${client.prenom} ${client.nom}`.toLowerCase().trim();
      
      console.log("PublicClientPersonalInfo - Looking for operations for:", clientFullName);
      
      operations.forEach(op => {
        if (op.type === "deposit") {
          balance += Number(op.amount);
          console.log("PublicClientPersonalInfo - Added deposit:", op.amount, "New balance:", balance);
        } else if (op.type === "withdrawal") {
          balance -= Number(op.amount);
          console.log("PublicClientPersonalInfo - Subtracted withdrawal:", op.amount, "New balance:", balance);
        } else if (op.type === "transfer") {
          // Check if this client is sender or receiver
          if (op.to_client && op.to_client.toLowerCase().trim() === clientFullName) {
            balance += Number(op.amount); // Receiving transfer
            console.log("PublicClientPersonalInfo - Received transfer:", op.amount, "New balance:", balance);
          } else if (op.from_client && op.from_client.toLowerCase().trim() === clientFullName) {
            balance -= Number(op.amount); // Sending transfer
            console.log("PublicClientPersonalInfo - Sent transfer:", op.amount, "New balance:", balance);
          }
        } else if (op.type === "direct_transfer") {
          // Handle direct transfers
          if (op.to_client && op.to_client.toLowerCase().trim() === clientFullName) {
            balance += Number(op.amount); // Receiving direct transfer
            console.log("PublicClientPersonalInfo - Received direct transfer:", op.amount, "New balance:", balance);
          } else if (op.from_client && op.from_client.toLowerCase().trim() === clientFullName) {
            balance -= Number(op.amount); // Sending direct transfer
            console.log("PublicClientPersonalInfo - Sent direct transfer:", op.amount, "New balance:", balance);
          }
        }
      });
      
      console.log("PublicClientPersonalInfo - Final calculated balance:", balance);
      return balance;
    }
    
    console.log("PublicClientPersonalInfo - No operations, returning client.solde:", client.solde);
    return client.solde || 0;
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
