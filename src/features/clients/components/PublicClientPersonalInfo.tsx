
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ClientIdBadge } from "./ClientIdBadge";
import { User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PublicClientPersonalInfoProps {
  client: Client;
  operations?: any[];
}

export const PublicClientPersonalInfo = ({
  client,
  operations = []
}: PublicClientPersonalInfoProps) => {
  const { formatCurrency } = useCurrency();

  // Calculate the effective balance using the SAME logic as all other pages
  const calculateEffectiveBalance = () => {
    console.log("PublicClientPersonalInfo - Calculating balance for:", client.prenom, client.nom);
    console.log("PublicClientPersonalInfo - Operations received:", operations);
    console.log("PublicClientPersonalInfo - Operations count:", operations.length);
    
    if (!operations || operations.length === 0) {
      console.log("PublicClientPersonalInfo - No operations, returning 0");
      return 0;
    }

    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log("PublicClientPersonalInfo - Looking for operations for:", clientFullName);
    
    // Filtrer les opérations qui concernent ce client
    const clientOperations = operations.filter(op => {
      const isDeposit = op.type === "deposit" && op.fromClient === clientFullName;
      const isWithdrawal = op.type === "withdrawal" && op.fromClient === clientFullName;
      const isTransferReceived = op.type === "transfer" && op.toClient === clientFullName;
      const isTransferSent = op.type === "transfer" && op.fromClient === clientFullName;
      const isDirectReceived = op.type === "direct_transfer" && op.toClient === clientFullName;
      const isDirectSent = op.type === "direct_transfer" && op.fromClient === clientFullName;
      
      return isDeposit || isWithdrawal || isTransferReceived || isTransferSent || isDirectReceived || isDirectSent;
    });
    
    console.log("PublicClientPersonalInfo - Filtered client operations:", clientOperations.length);
    console.log("PublicClientPersonalInfo - Client operations details:", clientOperations);
    
    // Calculate totals by operation type - MÊME LOGIQUE QUE PARTOUT AILLEURS
    const totalDeposits = clientOperations
      .filter(op => op.type === "deposit")
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding deposit:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    const totalWithdrawals = clientOperations
      .filter(op => op.type === "withdrawal")
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding withdrawal:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    // Separate transfers received and sent
    const transfersReceived = clientOperations
      .filter(op => op.type === "transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding received transfer:", op.amount, "from", op.fromClient);
        return total + Number(op.amount);
      }, 0);
      
    const transfersSent = clientOperations
      .filter(op => op.type === "transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding sent transfer:", op.amount, "to", op.toClient);
        return total + Number(op.amount);
      }, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = clientOperations
      .filter(op => op.type === "direct_transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding received direct transfer:", op.amount, "from", op.fromClient);
        return total + Number(op.amount);
      }, 0);
      
    const directOperationsSent = clientOperations
      .filter(op => op.type === "direct_transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicClientPersonalInfo - Adding sent direct transfer:", op.amount, "to", op.toClient);
        return total + Number(op.amount);
      }, 0);
      
    // LOGIQUE UNIFIÉE: total versements - total retraits + total virements reçus - total virements émis + total opérations directes reçues - total opérations directes émises
    const effectiveBalance = totalDeposits - totalWithdrawals + transfersReceived - transfersSent + directOperationsReceived - directOperationsSent;
    
    console.log("PublicClientPersonalInfo - Final calculated balance:", effectiveBalance);
    console.log("PublicClientPersonalInfo - Breakdown:", {
      totalDeposits,
      totalWithdrawals,
      transfersReceived,
      transfersSent,
      directOperationsReceived,
      directOperationsSent,
      formula: `${totalDeposits} - ${totalWithdrawals} + ${transfersReceived} - ${transfersSent} + ${directOperationsReceived} - ${directOperationsSent} = ${effectiveBalance}`
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
