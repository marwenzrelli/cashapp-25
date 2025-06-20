import { Operation } from "@/features/operations/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface PublicAccountFlowTabProps {
  operations: Operation[];
  client?: any; // Add client prop to access client name
}

export const PublicAccountFlowTab = ({
  operations,
  client
}: PublicAccountFlowTabProps) => {
  const { currency } = useCurrency();

  // Sort operations by date and calculate running balance
  const processedOperations = useMemo(() => {
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    
    console.log("=== DEBUG BALANCE CALCULATION START ===");
    console.log("Client:", clientFullName);
    console.log("Total operations received:", operations.length);
    
    // DEBUG: Log all operations to see what we're working with
    operations.forEach((op, i) => {
      console.log(`Operation ${i + 1}:`, {
        id: op.id,
        type: op.type,
        amount: op.amount,
        fromClient: op.fromClient,
        toClient: op.toClient,
        date: op.operation_date || op.date
      });
    });
    
    // Filtrer les opérations qui concernent ce client
    const clientOperations = operations.filter(op => {
      const isDeposit = op.type === "deposit" && op.fromClient === clientFullName;
      const isWithdrawal = op.type === "withdrawal" && op.fromClient === clientFullName;
      const isTransferReceived = op.type === "transfer" && op.toClient === clientFullName;
      const isTransferSent = op.type === "transfer" && op.fromClient === clientFullName;
      const isDirectReceived = op.type === "direct_transfer" && op.toClient === clientFullName;
      const isDirectSent = op.type === "direct_transfer" && op.fromClient === clientFullName;
      
      const isRelevant = isDeposit || isWithdrawal || isTransferReceived || isTransferSent || isDirectReceived || isDirectSent;
      
      if (isRelevant) {
        console.log(`✓ Operation ${op.id} included:`, {
          type: op.type,
          amount: op.amount,
          isDeposit, isWithdrawal, isTransferReceived, isTransferSent, isDirectReceived, isDirectSent
        });
      }
      
      return isRelevant;
    });
    
    console.log(`Filtered ${clientOperations.length} relevant operations for ${clientFullName}`);
    
    if (clientOperations.length === 0) {
      console.log("No operations found for this client");
      return [];
    }

    // Sort operations from oldest to newest (chronological order)
    const sortedOps = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("Operations sorted chronologically:");
    sortedOps.forEach((op, i) => {
      console.log(`${i + 1}. ${op.type} - ${op.amount} TND - ${op.operation_date || op.date}`);
    });

    // CALCUL CHRONOLOGIQUE: Commencer à 0 et calculer séquentiellement
    let runningBalance = 0;
    console.log("Starting balance calculation from 0");
    
    const opsWithBalance = sortedOps.map((op, index) => {
      const balanceBefore = runningBalance;
      let balanceChange = 0;
      
      console.log(`\n--- Processing operation ${index + 1}/${sortedOps.length} ---`);
      console.log("Operation details:", {
        id: op.id,
        type: op.type,
        amount: op.amount,
        fromClient: op.fromClient,
        toClient: op.toClient
      });
      console.log("Balance before this operation:", balanceBefore);
      
      if (op.type === "deposit") {
        balanceChange = Number(op.amount);
        console.log("Deposit: +" + balanceChange);
      } else if (op.type === "withdrawal") {
        balanceChange = -Number(op.amount);
        console.log("Withdrawal: " + balanceChange);
      } else if (op.type === "transfer") {
        if (op.toClient === clientFullName) {
          balanceChange = Number(op.amount);
          console.log("Transfer received: +" + balanceChange);
        } else if (op.fromClient === clientFullName) {
          balanceChange = -Number(op.amount);
          console.log("Transfer sent: " + balanceChange);
        } else {
          console.log("⚠️ Transfer doesn't match client name!");
        }
      } else if (op.type === "direct_transfer") {
        if (op.toClient === clientFullName) {
          balanceChange = Number(op.amount);
          console.log("Direct transfer received: +" + balanceChange);
        } else if (op.fromClient === clientFullName) {
          balanceChange = -Number(op.amount);
          console.log("Direct transfer sent: " + balanceChange);
        } else {
          console.log("⚠️ Direct transfer doesn't match client name!");
        }
      }
      
      runningBalance = balanceBefore + balanceChange;
      console.log("Balance change:", balanceChange);
      console.log("Balance after:", runningBalance);
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance,
        balanceChange
      };
    });

    console.log("\n=== FINAL BALANCE CALCULATION RESULTS ===");
    opsWithBalance.forEach((op, i) => {
      console.log(`${i + 1}. ${op.type} - Before: ${op.balanceBefore} - Change: ${op.balanceChange} - After: ${op.balanceAfter}`);
    });

    // Return in reverse order for display (newest first)
    const reversed = opsWithBalance.reverse();
    console.log("=== DEBUG BALANCE CALCULATION END ===\n");
    
    return reversed;
  }, [operations, client]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getAmountClass = (type: string, clientFullName: string, operation: any) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") {
      if (operation.toClient === clientFullName) return "text-green-600"; // Received
      if (operation.fromClient === clientFullName) return "text-red-600"; // Sent
    }
    if (type === "direct_transfer") {
      if (operation.toClient === clientFullName) return "text-green-600"; // Received
      if (operation.fromClient === clientFullName) return "text-red-600"; // Sent
    }
    return "text-blue-600";
  };

  const getAmountPrefix = (type: string, clientFullName: string, operation: any) => {
    // Only show negative prefix for outgoing operations (sent by the client)
    if (type === "withdrawal") return "- ";
    if (type === "transfer" && operation.fromClient === clientFullName) return "- ";
    if (type === "direct_transfer" && operation.fromClient === clientFullName) return "- ";
    // For all incoming operations (deposits, received transfers, received direct operations), show positive prefix
    return "+ ";
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : '';

  return (
    <Card className="mt-4">
      {/* Mobile view avec isPublicView={true} */}
      <AccountFlowMobileView operations={processedOperations} isPublicView={true} />

      {/* Desktop view */}
      <div className="hidden md:block">
        <ScrollArea className="h-[600px] w-full rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-right">Solde avant</TableHead>
                <TableHead className="w-[120px] text-right">Montant</TableHead>
                <TableHead className="w-[150px] text-right">Solde après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Aucune opération trouvée
                  </TableCell>
                </TableRow>
              ) : (
                processedOperations.map((op: any) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">
                      {formatDateTime(op.operation_date || op.date)}
                    </TableCell>
                    <TableCell>{op.id.toString().split('-')[1] || op.id}</TableCell>
                    <TableCell>
                      <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                        {getTypeIcon(op.type)}
                        {getTypeLabel(op.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {op.description || "-"}
                    </TableCell>
                    <TableCell className={`text-right ${getBalanceClass(op.balanceBefore)}`}>
                      {formatAmount(op.balanceBefore)}
                    </TableCell>
                    <TableCell className={`text-right ${getAmountClass(op.type, clientFullName, op)}`}>
                      {getAmountPrefix(op.type, clientFullName, op)}{formatAmount(op.amount)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                      {formatAmount(op.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};
