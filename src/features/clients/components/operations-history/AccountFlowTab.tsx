import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { useClients } from "@/features/clients/hooks/useClients";
import { useAccountFlowCalculations } from "./hooks/useAccountFlowCalculations";
import { useOperationsRefresh } from "@/features/operations/hooks/useOperationsRefresh";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw } from "lucide-react";

interface AccountFlowTabProps {
  operations: Operation[];
  clientId: number;
  updateOperation?: (operation: Operation) => Promise<void>;
  refreshOperations?: () => Promise<void>;
}

export const AccountFlowTab = ({ operations, updateOperation, clientId, refreshOperations }: AccountFlowTabProps) => {
  const { clients, loading: clientsLoading } = useClients();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use operations refresh hook if available
  const { refreshOperationsWithFeedback } = useOperationsRefresh(
    refreshOperations || (async () => {}),
    setIsRefreshing
  );

  console.log(`AccountFlowTab - Processing ${operations.length} operations for client ${clientId}`);

  // Get current client
  const currentClient = clients?.find(c => c.id === clientId);

  // If client is not found in the clients list, create a minimal client object for calculations
  const clientForCalculations = currentClient || {
    id: clientId,
    prenom: "Client",
    nom: `#${clientId}`,
    solde: 0
  };

  // Use the unified calculation logic
  const processedOperations = useAccountFlowCalculations({ 
    operations, 
    client: clientForCalculations 
  });

  // Show loading if clients are still loading or if we have operations but no processed operations yet
  const isLoading = clientsLoading || (operations.length > 0 && processedOperations.length === 0 && currentClient);

  console.log(`AccountFlowTab - Operations received: ${operations.length}`);
  console.log(`AccountFlowTab - Processed operations: ${processedOperations.length}`);
  console.log(`AccountFlowTab - Loading: ${isLoading}`);

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
    const sign = op.balanceChange >= 0 ? "+" : "-";
    return `${sign} ${formatAmount(Math.abs(op.balanceChange))} TND`;
  };

  const getAmountClassForOperation = (op: any) => {
    if (op.balanceChange > 0) return "text-green-600 dark:text-green-400";
    if (op.balanceChange < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Desktop skeleton */}
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
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Show loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      {/* Mobile view */}
      <AccountFlowMobileView 
        operations={processedOperations}
        clientId={clientId}
      />

      {/* Desktop view */}
      <Card className="hidden md:block">
        {refreshOperations && (
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Flux de compte</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshOperationsWithFeedback}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </CardHeader>
        )}
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
