
import React, { useState } from "react";
import { Operation } from "@/features/operations/types";
import { OperationsMobileCard } from "../OperationsMobileCard";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { toast } from "sonner";
import { TotalsSection } from "./TotalsSection";
import { getOperationTypeColor } from "./OperationTypeHelpers";

interface OperationsMobileListProps {
  operations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const OperationsMobileList = ({ 
  operations, 
  currency = "TND",
  updateOperation
}: OperationsMobileListProps) => {
  const { deleteOperation, refreshOperations } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCardClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOperation(null);
  };

  const handleEditOperation = async (updatedOperation: Operation) => {
    if (updateOperation) {
      try {
        await updateOperation(updatedOperation);
        toast.success("Opération modifiée avec succès");
        setIsDetailsModalOpen(false);
      } catch (error) {
        console.error("Edit operation error:", error);
        toast.error("Erreur lors de la modification");
      }
      return Promise.resolve();
    }
    toast.error("Fonction de modification non disponible");
    return Promise.reject("Update function not available");
  };

  const handleDeleteOperation = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOperation = async (): Promise<boolean> => {
    if (!selectedOperation) return false;
    
    try {
      await deleteOperation(selectedOperation);
      toast.success("Opération supprimée avec succès");
      setIsDeleteDialogOpen(false);
      refreshOperations();
      setSelectedOperation(null);
      return true;
    } catch (error) {
      console.error("Delete operation error:", error);
      toast.error("Erreur lors de la suppression", { 
        description: typeof error === 'string' ? error : error instanceof Error ? error.message : "Une erreur s'est produite" 
      });
      return false;
    }
  };

  // Get icon based on operation type
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Format amount with + or - prefix based on operation type
  const formatAmount = (amount: number, type: string): string => {
    const formattedAmount = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
    return type === 'withdrawal' ? `- ${formattedAmount}` : 
           type === 'deposit' ? `+ ${formattedAmount}` : 
           formattedAmount;
  };

  return (
    <div className="space-y-3">
      {operations.map(operation => (
        <div 
          key={operation.id} 
          className="cursor-pointer"
          onClick={() => handleCardClick(operation)}
        >
          <OperationsMobileCard 
            operation={operation} 
            formatAmount={(amount) => formatAmount(amount, operation.type)} 
            currency={currency}
            colorClass={getOperationTypeColor(operation.type)}
            showId={true} 
          />
        </div>
      ))}

      <div className="mt-4">
        <TotalsSection operations={operations} currency={currency} />
      </div>

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
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={confirmDeleteOperation}
        operation={selectedOperation}
      />
    </div>
  );
};
