
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

  // Calculate effective balance using the EXACT SAME logic as PublicClientPersonalInfo
  const calculateEffectiveBalance = () => {
    console.log("PublicAccountFlowTab - Calculating balance for:", client?.prenom, client?.nom);
    console.log("PublicAccountFlowTab - Operations count:", operations?.length || 0);
    console.log("PublicAccountFlowTab - All operations:", operations);
    
    if (!operations || operations.length === 0 || !client) {
      console.log("PublicAccountFlowTab - No operations or client, returning 0");
      return 0;
    }

    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log("PublicAccountFlowTab - Looking for operations for:", clientFullName);
    
    // Filtrer les opérations qui concernent ce client - EXACTEMENT LA MÊME LOGIQUE QUE PublicClientPersonalInfo
    const clientOperations = operations.filter(op => {
      const isDeposit = op.type === "deposit" && op.fromClient === clientFullName;
      const isWithdrawal = op.type === "withdrawal" && op.fromClient === clientFullName;
      const isTransferReceived = op.type === "transfer" && op.toClient === clientFullName;
      const isTransferSent = op.type === "transfer" && op.fromClient === clientFullName;
      const isDirectReceived = op.type === "direct_transfer" && op.toClient === clientFullName;
      const isDirectSent = op.type === "direct_transfer" && op.fromClient === clientFullName;
      
      return isDeposit || isWithdrawal || isTransferReceived || isTransferSent || isDirectReceived || isDirectSent;
    });
    
    console.log("PublicAccountFlowTab - Filtered client operations:", clientOperations.length);
    console.log("PublicAccountFlowTab - Client operations details:", clientOperations);
    
    // Calculate totals by operation type - EXACTEMENT LA MÊME LOGIQUE QUE PublicClientPersonalInfo
    const totalDeposits = clientOperations
      .filter(op => op.type === "deposit")
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding deposit:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    const totalWithdrawals = clientOperations
      .filter(op => op.type === "withdrawal")
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding withdrawal:", op.amount);
        return total + Number(op.amount);
      }, 0);
      
    // Separate transfers received and sent
    const transfersReceived = clientOperations
      .filter(op => op.type === "transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding received transfer:", op.amount, "from", op.fromClient);
        return total + Number(op.amount);
      }, 0);
      
    const transfersSent = clientOperations
      .filter(op => op.type === "transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding sent transfer:", op.amount, "to", op.toClient);
        return total + Number(op.amount);
      }, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = clientOperations
      .filter(op => op.type === "direct_transfer" && op.toClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding received direct transfer:", op.amount, "from", op.fromClient);
        return total + Number(op.amount);
      }, 0);
      
    const directOperationsSent = clientOperations
      .filter(op => op.type === "direct_transfer" && op.fromClient === clientFullName)
      .reduce((total, op) => {
        console.log("PublicAccountFlowTab - Adding sent direct transfer:", op.amount, "to", op.toClient);
        return total + Number(op.amount);
      }, 0);
      
    // LOGIQUE UNIFIÉE: total versements - total retraits + total virements reçus - total virements émis + total opérations directes reçues - total opérations directes émises
    const effectiveBalance = totalDeposits - totalWithdrawals + transfersReceived - transfersSent + directOperationsReceived - directOperationsSent;
    
    console.log("PublicAccountFlowTab - Final calculated balance:", effectiveBalance);
    console.log("PublicAccountFlowTab - Breakdown:", {
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

  // Sort operations by date and calculate running balance
  const processedOperations = useMemo(() => {
    // Calculate the effective balance
    const finalBalance = calculateEffectiveBalance();
    
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    
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
    
    console.log("PublicAccountFlowTab - Processing operations for:", clientFullName, "Count:", clientOperations.length);
    
    // Sort operations from oldest to newest first
    const sortedOps = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Start with 0 and build up to the final balance
    let runningBalance = 0;
    const opsWithBalance = sortedOps.map((op, index) => {
      const balanceBefore = runningBalance;

      // Update running balance based on operation type and client relationship
      if (op.type === "deposit") {
        runningBalance += op.amount;
      } else if (op.type === "withdrawal") {
        runningBalance -= op.amount;
      } else if (op.type === "transfer") {
        if (op.toClient === clientFullName) {
          // Transfer received
          runningBalance += op.amount;
        } else if (op.fromClient === clientFullName) {
          // Transfer sent
          runningBalance -= op.amount;
        }
      } else if (op.type === "direct_transfer") {
        if (op.toClient === clientFullName) {
          // Direct operation received
          runningBalance += op.amount;
        } else if (op.fromClient === clientFullName) {
          // Direct operation sent
          runningBalance -= op.amount;
        }
      }
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance
      };
    });

    // Return sorted from newest to oldest for display
    return opsWithBalance.reverse();
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
    // For all incoming operations (deposits, received transfers, received direct operations), show no prefix (positive)
    return "";
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
                {/* Pas de colonne Actions dans la vue publique */}
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
                    <TableCell className="text-right">
                      {formatAmount(op.balanceBefore)}
                    </TableCell>
                    <TableCell className={`text-right ${getAmountClass(op.type, clientFullName, op)}`}>
                      {getAmountPrefix(op.type, clientFullName, op)}{formatAmount(op.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAmount(op.balanceAfter)}
                    </TableCell>
                    {/* Pas de cellule Actions dans la vue publique */}
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
