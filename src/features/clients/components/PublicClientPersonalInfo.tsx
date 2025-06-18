
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

  // Calculate net balance from operations exactly like in PersonalInfoFields
  const calculateNetBalance = () => {
    if (!operations || operations.length === 0) {
      return client.solde;
    }

    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    
    // Calculate totals by operation type - exactly the same logic as PersonalInfoFields
    const totalDeposits = operations
      .filter(op => op.type === "deposit")
      .reduce((total, op) => total + op.amount, 0);
      
    const totalWithdrawals = operations
      .filter(op => op.type === "withdrawal")
      .reduce((total, op) => total + op.amount, 0);
      
    // Separate transfers received and sent
    const transfersReceived = operations
      .filter(op => op.type === "transfer" && op.toClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    const transfersSent = operations
      .filter(op => op.type === "transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = operations
      .filter(op => op.type === "direct_transfer" && op.toClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    const directOperationsSent = operations
      .filter(op => op.type === "direct_transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    // Calculate net balance: initial balance + inflows - outflows
    return client.solde + totalDeposits + transfersReceived + directOperationsReceived - totalWithdrawals - transfersSent - directOperationsSent;
  };

  const netBalance = calculateNetBalance();
  const formattedBalance = formatCurrency(netBalance);
  
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
                <span className={cn("text-lg font-semibold inline-block mt-0.5", netBalance >= 0 ? "text-green-600" : "text-red-600")}>
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
