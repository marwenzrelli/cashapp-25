
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

  const processedOperations = useMemo(() => {
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    const clientId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
    
    console.log("=== FLUX DE COMPTE PUBLIC - CALCUL CHRONOLOGIQUE ===");
    console.log("Client:", clientFullName, "ID:", clientId);
    console.log("Solde actuel en base:", client.solde);
    console.log("Total operations reçues:", operations.length);
    
    // Filtrer les opérations concernant ce client avec une logique plus stricte
    const clientOperations = operations.filter(op => {
      // Vérifier d'abord par ID client (plus fiable)
      if (op.client_id === clientId) return true;
      if (op.from_client_id === clientId || op.to_client_id === clientId) return true;
      
      // Ensuite par nom exact (fallback)
      const isDeposit = op.type === "deposit" && op.fromClient === clientFullName;
      const isWithdrawal = op.type === "withdrawal" && op.fromClient === clientFullName;
      const isTransferReceived = op.type === "transfer" && op.toClient === clientFullName;
      const isTransferSent = op.type === "transfer" && op.fromClient === clientFullName;
      const isDirectReceived = op.type === "direct_transfer" && op.toClient === clientFullName;
      const isDirectSent = op.type === "direct_transfer" && op.fromClient === clientFullName;
      
      return isDeposit || isWithdrawal || isTransferReceived || isTransferSent || isDirectReceived || isDirectSent;
    });
    
    console.log(`Operations filtrées pour ${clientFullName}: ${clientOperations.length}`);
    
    if (clientOperations.length === 0) {
      console.log("Aucune opération trouvée pour ce client");
      return [];
    }

    // Tri chronologique strict (plus ancien → plus récent)
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      
      if (dateA === dateB) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA - dateB;
    });

    console.log("=== ORDRE CHRONOLOGIQUE DES OPÉRATIONS ===");
    sortedOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm");
      console.log(`${i + 1}. ${date} - ${op.type} - ${op.amount} TND - ID: ${op.id}`);
    });

    // CALCUL SÉQUENTIEL: Commencer à 0 et calculer chronologiquement
    console.log("\n=== CALCUL CHRONOLOGIQUE DU SOLDE ===");
    console.log("Démarrage du calcul à partir de 0.00 TND");
    
    let currentBalance = 0;
    
    const operationsWithBalance = sortedOperations.map((op, index) => {
      const balanceBefore = currentBalance;
      let balanceChange = 0;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm")}`);
      console.log(`Type: ${op.type}, Montant: ${op.amount} TND, ID: ${op.id}`);
      console.log(`Solde avant: ${balanceBefore.toFixed(3)} TND`);
      
      // Calcul de l'impact selon le type d'opération
      if (op.type === "deposit") {
        balanceChange = Number(op.amount);
        console.log(`📥 DÉPÔT: +${balanceChange} TND`);
      } else if (op.type === "withdrawal") {
        balanceChange = -Number(op.amount);
        console.log(`📤 RETRAIT: ${balanceChange} TND`);
      } else if (op.type === "transfer") {
        if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = Number(op.amount);
          console.log(`📥 VIREMENT REÇU: +${balanceChange} TND de "${op.fromClient}"`);
        } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -Number(op.amount);
          console.log(`📤 VIREMENT ENVOYÉ: ${balanceChange} TND vers "${op.toClient}"`);
        }
      } else if (op.type === "direct_transfer") {
        if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = Number(op.amount);
          console.log(`📥 OPÉRATION DIRECTE REÇUE: +${balanceChange} TND de "${op.fromClient}"`);
        } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -Number(op.amount);
          console.log(`📤 OPÉRATION DIRECTE ENVOYÉE: ${balanceChange} TND vers "${op.toClient}"`);
        }
      }
      
      // Mise à jour du solde
      currentBalance = balanceBefore + balanceChange;
      
      console.log(`Impact: ${balanceChange >= 0 ? '+' : ''}${balanceChange} TND`);
      console.log(`Nouveau solde: ${currentBalance.toFixed(3)} TND`);
      
      return {
        ...op,
        balanceBefore: Number(balanceBefore.toFixed(3)),
        balanceAfter: Number(currentBalance.toFixed(3)),
        balanceChange: Number(balanceChange.toFixed(3))
      };
    });

    console.log("\n=== VÉRIFICATION FINALE ===");
    console.log(`Solde calculé chronologiquement: ${currentBalance.toFixed(3)} TND`);
    console.log(`Solde actuel en base: ${Number(client.solde).toFixed(3)} TND`);
    
    const difference = Math.abs(currentBalance - Number(client.solde));
    console.log(`Écart: ${difference.toFixed(3)} TND`);
    
    if (difference > 0.01) {
      console.warn("⚠️  ÉCART DÉTECTÉ entre le calcul chronologique et le solde en base!");
      console.warn("Cela peut indiquer des opérations manquantes ou des incohérences dans les données.");
    } else {
      console.log("✅ Calcul chronologique cohérent avec le solde en base.");
    }

    // Retourner en ordre inverse pour l'affichage (plus récent en premier)
    const reversedForDisplay = [...operationsWithBalance].reverse();
    
    console.log("\n=== ORDRE D'AFFICHAGE (plus récent en premier) ===");
    reversedForDisplay.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm");
      console.log(`${i + 1}. ${date} - Avant: ${op.balanceBefore} TND → Après: ${op.balanceAfter} TND`);
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
      if (operation.toClient === clientFullName) return "text-green-600";
      if (operation.fromClient === clientFullName) return "text-red-600";
    }
    if (type === "direct_transfer") {
      if (operation.toClient === clientFullName) return "text-green-600";
      if (operation.fromClient === clientFullName) return "text-red-600";
    }
    return "text-blue-600";
  };

  const getAmountPrefix = (type: string, clientFullName: string, operation: any) => {
    if (type === "withdrawal") return "- ";
    if (type === "transfer" && operation.fromClient === clientFullName) return "- ";
    if (type === "direct_transfer" && operation.fromClient === clientFullName) return "- ";
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
      <AccountFlowMobileView operations={processedOperations} isPublicView={true} />

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
