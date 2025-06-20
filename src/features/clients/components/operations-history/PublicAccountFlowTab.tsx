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
  client?: any;
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
    
    console.log("=== CALCUL CHRONOLOGIQUE DU BAS VERS LE HAUT ===");
    console.log("Client:", clientFullName);
    console.log("Total operations reçues:", operations.length);
    
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
    
    console.log(`${clientOperations.length} opérations filtrées pour ${clientFullName}`);
    
    if (clientOperations.length === 0) {
      console.log("Aucune opération trouvée pour ce client");
      return [];
    }

    // Trier par date CHRONOLOGIQUE (du plus ancien au plus récent)
    const sortedOpsChronological = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("Opérations triées chronologiquement (plus ancien en premier):");
    sortedOpsChronological.forEach((op, i) => {
      console.log(`${i + 1}. ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm")} - ${op.type} - ${op.amount} TND`);
    });

    // CALCUL CHRONOLOGIQUE: Commencer à 0 et calculer du bas vers le haut
    let runningBalance = 0;
    console.log("Démarrage du calcul chronologique avec solde = 0");
    
    const opsWithBalance = sortedOpsChronological.map((op, index) => {
      const balanceBefore = runningBalance;
      let balanceChange = 0;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOpsChronological.length} ---`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm")}`);
      console.log(`Type: ${op.type}, Montant: ${op.amount}`);
      console.log(`Solde AVANT cette opération: ${balanceBefore}`);
      
      // Calculer l'impact sur le solde
      if (op.type === "deposit") {
        balanceChange = Number(op.amount);
        console.log(`✅ Versement: +${balanceChange}`);
      } else if (op.type === "withdrawal") {
        balanceChange = -Number(op.amount);
        console.log(`❌ Retrait: ${balanceChange}`);
      } else if (op.type === "transfer") {
        if (op.toClient === clientFullName) {
          balanceChange = Number(op.amount);
          console.log(`📥 Virement reçu: +${balanceChange}`);
        } else if (op.fromClient === clientFullName) {
          balanceChange = -Number(op.amount);
          console.log(`📤 Virement envoyé: ${balanceChange}`);
        }
      } else if (op.type === "direct_transfer") {
        if (op.toClient === clientFullName) {
          balanceChange = Number(op.amount);
          console.log(`📥 Opération directe reçue: +${balanceChange}`);
        } else if (op.fromClient === clientFullName) {
          balanceChange = -Number(op.amount);
          console.log(`📤 Opération directe envoyée: ${balanceChange}`);
        }
      }
      
      runningBalance = balanceBefore + balanceChange;
      console.log(`Changement: ${balanceChange}`);
      console.log(`Solde APRÈS cette opération: ${runningBalance}`);
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance,
        balanceChange
      };
    });

    console.log("\n=== RÉSULTATS FINAUX (ordre chronologique) ===");
    opsWithBalance.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm");
      console.log(`${i + 1}. ${date} - ${op.type} - Avant: ${op.balanceBefore} → Après: ${op.balanceAfter}`);
    });

    // Inverser pour l'affichage (plus récent en premier) mais les calculs sont corrects
    const reversedForDisplay = [...opsWithBalance].reverse();
    console.log("\n=== ORDRE D'AFFICHAGE (plus récent en premier) ===");
    reversedForDisplay.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm");
      console.log(`${i + 1}. ${date} - Avant: ${op.balanceBefore} → Après: ${op.balanceAfter}`);
    });
    
    return reversedForDisplay;
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
