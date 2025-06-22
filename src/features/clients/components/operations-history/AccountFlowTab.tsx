
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { useClients } from "@/features/clients/hooks/useClients";
import { useAccountFlowCalculations } from "./hooks/useAccountFlowCalculations";

interface AccountFlowTabProps {
  operations: Operation[];
  clientId: number;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AccountFlowTab = ({ operations, updateOperation, clientId }: AccountFlowTabProps) => {
  const { clients } = useClients();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  console.log(`AccountFlowTab - Processing ${operations.length} operations for client ${clientId}`);
  console.log(`Available clients:`, clients?.map(c => ({ id: c.id, name: `${c.prenom} ${c.nom}` })));

  // Get current client
  const currentClient = clients?.find(c => c.id === clientId);

  console.log(`Current client found:`, currentClient ? `${currentClient.prenom} ${currentClient.nom}` : 'Not found');

  // If client is not found in the clients list, create a minimal client object for calculations
  const clientForCalculations = currentClient || {
    id: clientId,
    prenom: "Client",
    nom: `#${clientId}`,
    solde: 0 // We'll calculate the real balance from operations
  };

  console.log(`Using client for calculations:`, clientForCalculations);

  // Use the unified calculation logic
  const processedOperations = useAccountFlowCalculations({ 
    operations, 
    client: clientForCalculations 
  });

  console.log(`AccountFlowTab - Processed operations: ${processedOperations.length}`);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return Math.abs(amount).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  const handleRowClick = (operation: Operation) => {
    if (updateOperation) {
      setSelectedOperation(operation);
      setIsEditDialogOpen(true);
    }
  };

  const handleOperationUpdate = async (updatedOperation: Operation): Promise<void> => {
    if (updateOperation) {
      await updateOperation(updatedOperation);
      setIsEditDialogOpen(false);
    }
  };

  const getAmountDisplay = (op: any) => {
    // Show the actual balance change with proper sign
    const sign = op.balanceChange >= 0 ? "+" : "-";
    return `${sign} ${formatAmount(Math.abs(op.balanceChange))} TND`;
  };

  const getAmountClassForOperation = (op: any) => {
    if (op.balanceChange > 0) return "text-green-600 dark:text-green-400";
    if (op.balanceChange < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <>
      {/* Mobile view */}
      <AccountFlowMobileView 
        operations={processedOperations}
        clientId={clientId}
      />

      {/* Desktop view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
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
                    <TableCell colSpan={8} className="h-24 text-center">
                      {!currentClient ? (
                        <div className="text-orange-600">
                          Client non trouvé (ID: {clientId}). Vérifiez que le client existe.
                        </div>
                      ) : (
                        "Aucune opération trouvée pour ce client"
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  processedOperations.map((op, index) => {
                    // Calculer le numéro chronologique (inverse de l'index d'affichage)
                    const chronologicalNumber = processedOperations.length - index;
                    
                    return (
                      <TableRow 
                        key={op.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(op)}
                      >
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {chronologicalNumber}
                        </TableCell>
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
                          {formatAmount(op.balanceBefore)} TND
                        </TableCell>
                        <TableCell className={`text-right ${getAmountClassForOperation(op)}`}>
                          {getAmountDisplay(op)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                          {formatAmount(op.balanceAfter)} TND
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {selectedOperation && (
          <EditOperationDialog 
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            operation={selectedOperation}
            onConfirm={handleOperationUpdate}
          />
        )}
      </Card>
    </>
  );
};
