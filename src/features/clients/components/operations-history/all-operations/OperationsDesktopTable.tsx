
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { formatId } from "@/utils/formatId";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { toast } from "sonner";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { cn } from "@/lib/utils";
import { TotalsSection } from "./TotalsSection";
import { getOperationTypeColor } from "./OperationTypeHelpers";

interface OperationsDesktopTableProps {
  operations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const OperationsDesktopTable = ({ 
  operations,
  currency = "TND",
  updateOperation
}: OperationsDesktopTableProps) => {
  const { refreshOperations, deleteOperation } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRowClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOperation(null);
  };

  const handleEditOperation = async (updatedOperation: Operation) => {
    if (updateOperation) {
      return updateOperation(updatedOperation);
    }
    toast.error("Fonction de modification non disponible");
    return Promise.reject("Update function not available");
  };

  const handleDeleteOperation = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOperation = async () => {
    if (!selectedOperation) return;
    
    try {
      await deleteOperation(selectedOperation);
      toast.success("Opération supprimée avec succès");
      refreshOperations();
    } catch (error) {
      console.error("Delete operation error:", error);
      toast.error("Erreur lors de la suppression", { 
        description: typeof error === 'string' ? error : error instanceof Error ? error.message : "Une erreur s'est produite" 
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedOperation(null);
    }
  };

  const cancelDeleteOperation = () => {
    setIsDeleteDialogOpen(false);
    setSelectedOperation(null);
  };

  // Format number with 3 decimal places and comma separator for Tunisian currency
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  };

  // Get type-specific display text
  const getOperationTypeDisplay = (type: string): string => {
    switch (type) {
      case "deposit":
        return "Dépôt";
      case "withdrawal":
        return "Retrait";
      case "transfer":
        return "Transfert";
      default:
        return "Inconnu";
    }
  };

  // Get icon component based on operation type
  const getOperationTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return ArrowUpRight;
      case "withdrawal":
        return ArrowDownRight;
      case "transfer":
        return ArrowLeftRight;
      default:
        return ArrowUpRight;
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[5%]">Type</TableHead>
              <TableHead className="w-[10%]">ID</TableHead>
              <TableHead className="w-[15%]">Date</TableHead>
              <TableHead className="w-[20%]">Client</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => {
              // Use operation_date if available, otherwise fall back to date
              const displayDate = operation.operation_date || operation.date;
              const formattedDate = typeof displayDate === 'string' 
                ? format(new Date(displayDate), "dd/MM/yyyy HH:mm") 
                : format(displayDate, "dd/MM/yyyy HH:mm");
              
              // Format operation ID
              const operationId = isNaN(parseInt(operation.id)) 
                ? operation.id 
                : formatId(parseInt(operation.id));
              
              // Get type-specific display properties
              const typeDisplay = getOperationTypeDisplay(operation.type);
              const TypeIcon = getOperationTypeIcon(operation.type);
              const typeColor = getOperationTypeColor(operation.type);
              const amountPrefix = operation.type === 'withdrawal' ? '- ' : '';
              
              return (
                <TableRow 
                  key={operation.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(operation)}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <TypeIcon className={cn("h-5 w-5", typeColor)} />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {operation.fromClient}
                    {operation.type === 'transfer' && operation.toClient && (
                      <span className="text-xs text-muted-foreground block">
                        → {operation.toClient}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {operation.description || <span className="text-muted-foreground italic">Aucune description</span>}
                  </TableCell>
                  <TableCell className={cn("text-right font-medium whitespace-nowrap", typeColor)}>
                    {amountPrefix}{formatNumber(operation.amount)} {currency}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TotalsSection operations={operations} currency={currency} />

      {/* Details modal */}
      <OperationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        operation={selectedOperation}
        onEdit={handleEditOperation}
        onDelete={handleDeleteOperation}
      />

      {/* Delete confirmation dialog */}
      <DeleteOperationDialog
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteOperation}
        onConfirm={confirmDeleteOperation}
        operation={selectedOperation}
      />
    </>
  );
};
