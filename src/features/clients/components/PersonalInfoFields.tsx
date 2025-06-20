
import { User, Phone, Mail, Calendar, Wallet, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { Client } from "../types";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Operation } from "@/features/operations/types";

interface PersonalInfoFieldsProps {
  client: Client;
  formatAmount?: (amount: number) => string;
  showBalanceOnMobile?: boolean;
  showBalance?: boolean;
  realTimeBalance?: number | null;
  clientOperations?: Operation[];
}

export const PersonalInfoFields = ({
  client,
  formatAmount,
  showBalanceOnMobile = false,
  showBalance = true,
  realTimeBalance = null,
  clientOperations = []
}: PersonalInfoFieldsProps) => {
  // Use the currency context for formatting
  const { formatCurrency } = useCurrency();
  
  // Use provided formatAmount function or fall back to currency context formatter
  const formatDisplayAmount = formatAmount || formatCurrency;
  
  // Calculate effective balance from operations if available
  const calculateNetBalance = () => {
    // If real-time balance is available, use it
    if (typeof realTimeBalance === 'number') {
      return realTimeBalance;
    }

    // If no operations available, use client.solde
    if (!clientOperations || clientOperations.length === 0) {
      return client.solde;
    }

    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    
    // Calculate totals by operation type
    const totalDeposits = clientOperations
      .filter(op => op.type === "deposit")
      .reduce((total, op) => total + op.amount, 0);
      
    const totalWithdrawals = clientOperations
      .filter(op => op.type === "withdrawal")
      .reduce((total, op) => total + op.amount, 0);
      
    // Separate transfers received and sent
    const transfersReceived = clientOperations
      .filter(op => op.type === "transfer" && op.toClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    const transfersSent = clientOperations
      .filter(op => op.type === "transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = clientOperations
      .filter(op => op.type === "direct_transfer" && op.toClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    const directOperationsSent = clientOperations
      .filter(op => op.type === "direct_transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => total + op.amount, 0);
      
    // Calculate net movement with correct formula: 
    // Solde = dépôts + transferts reçus + opérations directes reçues - retraits - transferts émis - opérations directes émises
    return totalDeposits + transfersReceived + directOperationsReceived - totalWithdrawals - transfersSent - directOperationsSent;
  };

  const effectiveBalance = calculateNetBalance();
  
  console.log("PersonalInfoFields displaying balance:", {
    realTimeBalance,
    clientSolde: client.solde,
    effectiveBalance,
    hasOperations: clientOperations.length > 0,
    clientName: `${client.prenom} ${client.nom}`
  });
  
  return (
    <div className="w-full space-y-6 rounded-lg">
      {/* Client primary info with gradient card */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 shadow-sm w-full">
        <div className="flex items-center gap-4 mb-4 w-full">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="w-full">
            <h3 className="text-xl font-semibold tracking-tight">
              {client.prenom} {client.nom}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-primary/70" />
              Client vérifié
            </p>
            {/* Current balance date display */}
            <p className="text-sm text-muted-foreground mt-2">
              Solde actuel au {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex items-center gap-3 w-full">
            <Phone className="h-5 w-5 text-primary" />
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <p className="font-medium w-full">{client.telephone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <Mail className="h-5 w-5 text-primary" />
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium w-full overflow-hidden text-ellipsis">
                {client.email || "Non renseigné"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Date de création</p>
              <p className="font-medium">
                {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
        
        {showBalance && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
            <div className="flex items-center gap-3 w-full">
              <div className="bg-primary/10 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground">Solde</p>
                <span className={cn(
                  "font-medium px-3 py-1.5 mt-1 inline-block border rounded-md w-full", 
                  effectiveBalance >= 0 
                    ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20" 
                    : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20"
                )}>
                  {formatDisplayAmount(Math.abs(effectiveBalance))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
