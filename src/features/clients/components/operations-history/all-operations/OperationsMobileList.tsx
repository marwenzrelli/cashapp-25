
import React, { useState, useEffect } from "react";
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
  const { deleteOperation, confirmDeleteOperation, refreshOperations, isProcessing } = useOperations();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Effet pour surveiller les modifications de opérations et forcer un rafraîchissement
  useEffect(() => {
    if (refreshTrigger > 0) {
      const timeoutId = setTimeout(() => {
        console.log("Rafraîchissement forcé après suppression...", refreshTrigger);
        refreshOperations(true);
      }, 5000); // Augmenter le délai à 5 secondes pour s'assurer que la base de données a le temps de propager les changements
      
      return () => clearTimeout(timeoutId);
    }
  }, [refreshTrigger, refreshOperations]);

  const handleCardClick = (operation: Operation) => {
    // Créer une copie profonde de l'opération pour éviter les problèmes de référence
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
        
        // Forcer le rafraîchissement après modification
        await refreshOperations(true);
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
    // Créer une copie profonde pour éviter les problèmes de référence
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
      
      // Faire une copie fraîche de l'opération sélectionnée
      const opToDelete = JSON.parse(JSON.stringify(selectedOperation));
      console.log("OperationsMobileList - Suppression avec opération:", opToDelete);
      
      // Passer explicitement l'opération à confirmDeleteOperation
      const success = await confirmDeleteOperation(opToDelete);
      console.log("OperationsMobileList - Résultat de la suppression:", success);
      
      if (success) {
        setIsDeleteDialogOpen(false);
        setSelectedOperation(null);
        
        // Attendre avant de rafraîchir pour s'assurer que le traitement backend est terminé
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Incrémenter le déclencheur de rafraîchissement et planifier plusieurs rafraîchissements
        setRefreshTrigger(prev => prev + 1);
        
        // Forcer le rafraîchissement immédiatement avec le paramètre true
        await refreshOperations(true);
        
        // Planifier une séquence de rafraîchissements
        setTimeout(() => refreshOperations(true), 2000);
        setTimeout(() => refreshOperations(true), 5000);  
        setTimeout(() => refreshOperations(true), 8000);
        
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
        onDelete={performDeleteOperation}
        operation={selectedOperation}
        isLoading={isDeleting || isProcessing}
      />
    </div>
  );
};
