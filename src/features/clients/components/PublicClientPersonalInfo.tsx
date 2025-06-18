
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

  // Calculate the effective balance exactly like in PersonalInfoFields
  const calculateEffectiveBalance = () => {
    console.log("PublicClientPersonalInfo - Calculating balance for:", client.prenom, client.nom);
    console.log("PublicClientPersonalInfo - Operations count:", operations.length);
    console.log("PublicClientPersonalInfo - Client solde from DB:", client.solde);
    
    if (!operations || operations.length === 0) {
      console.log("PublicClientPersonalInfo - No operations, returning 0");
      return 0; // Changement: retourner 0 au lieu du solde DB quand pas d'opérations
    }

    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log("PublicClientPersonalInfo - Looking for operations for:", clientFullName);
    
    // Calculate totals by operation type exactly like PersonalInfoFields
    const totalDeposits = operations
      .filter(op => op.type === "deposit")
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding deposit:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    const totalWithdrawals = operations
      .filter(op => op.type === "withdrawal")
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding withdrawal:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    // Separate transfers received and sent
    const transfersReceived = operations
      .filter(op => op.type === "transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding received transfer:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    const transfersSent = operations
      .filter(op => op.type === "transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding sent transfer:", op.amount);
        return total + Number(op.amount);
      }, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = operations
      .filter(op => op.type === "direct_transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding received direct transfer:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    const directOperationsSent = operations
      .filter(op => op.type === "direct_transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding sent direct transfer:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    // Calculate net movement with correct formula: 
    // Balance = deposits + transfers received + direct operations received - withdrawals - transfers sent - direct operations sent
    const effectiveBalance = totalDeposits + transfersReceived + directOperationsReceived - totalWithdrawals - transfersSent - directOperationsSent;
    
    console.log("PublicClientPersonalInfo - Final calculated balance:", effectiveBalance);
    console.log("PublicClientPersonalInfo - Breakdown:", {
      totalDeposits,
      totalWithdrawals,
      transfersReceived,
      transfersSent,
      directOperationsReceived,
      directOperationsSent
    });
    
    return effectiveBalance;
  };

  const effectiveBalance = calculateEffectiveBalance();
  
  // Use formatCurrency for consistent formatting
  const formattedBalance = formatCurrency(effectiveBalance);
  
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
