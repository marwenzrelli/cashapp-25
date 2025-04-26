import React, { useState } from "react";
import { OperationsMobileCard } from "../OperationsMobileCard";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import { OperationDetailsModal } from "@/features/operations/components/OperationDetailsModal";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { toast } from "sonner";
import { TotalsSection } from "./TotalsSection";
import { getOperationTypeColor } from "./OperationTypeHelpers";
import { deleteOperation } from "@/features/operations/utils/deletionUtils";
import { useFormatAmount } from "@/hooks/use-format-amount";

interface OperationsMobileListProps {
  operations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const OperationsMobileList = ({ 
  operations, 
  currency = "TND",
  updateOperation,
  onOperationDeleted
}: OperationsMobileListProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
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
        
        if (onOperationDeleted) {
          await onOperationDeleted();
        }
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
    console.log("OperationsMobileList - handleDeleteOperation:", operation);
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDetailsModalOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const performDeleteOperation = async (): Promise<boolean> => {
    if (!selectedOperation) {
      console.error("OperationsMobileList - Aucune opération sélectionnée pour la suppression");
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log("OperationsMobileList - Tentative de suppression de l'opération:", selectedOperation.id, "type:", selectedOperation.type);
      
      const success = await deleteOperation(selectedOperation);
      console.log("OperationsMobileList - Résultat de la suppression:", success);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        setSelectedOperation(null);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (onOperationDeleted) {
          await onOperationDeleted();
          
          setTimeout(async () => {
            if (onOperationDeleted) {
              await onOperationDeleted();
            }
          }, 3000);
        }
        
        return true;
      } else {
        toast.error("Erreur lors de la suppression", { 
          description: "L'opération n'a pas pu être supprimée"
        });
        return false;
      }
    } catch (error) {
      console.error("OperationsMobileList - Delete operation error:", error);
      toast.error("Erreur lors de la suppression", { 
        description: typeof error === 'string' ? error : error instanceof Error ? error.message : "Une erreur s'est produite" 
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

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

  const formatAmount = (amount: number, type: string): string => {
    const { formatAmount: formatAmountFn } = useFormatAmount();
    const formattedAmount = formatAmountFn(amount);
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

      <OperationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        operation={selectedOperation}
        onEdit={handleEditOperation}
        onDelete={handleDeleteOperation}
      />

      <DeleteOperationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={performDeleteOperation}
        operation={selectedOperation}
        isLoading={isDeleting}
      />
    </div>
  );
};
