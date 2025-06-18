
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { toast } from "sonner";
import { deleteOperation } from "@/features/operations/utils/deletionUtils";

interface UseOperationHandlersProps {
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const useOperationHandlers = ({
  updateOperation,
  onOperationDeleted
}: UseOperationHandlersProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleIdClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDetailsModalOpen(true);
  };

  const handleEditClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsDeleteDialogOpen(true);
  };

  const handleTransferClick = (operation: Operation) => {
    setSelectedOperation(JSON.parse(JSON.stringify(operation)));
    setIsTransferDialogOpen(true);
  };

  const handleOperationUpdate = async (updatedOperation: Operation) => {
    if (updateOperation) {
      try {
        await updateOperation(updatedOperation);
        toast.success("Opération modifiée avec succès");
        setIsDetailsModalOpen(false);
        if (onOperationDeleted) {
          await onOperationDeleted();
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'opération:", error);
        toast.error("Erreur lors de la modification");
      }
    } else {
      console.warn("Fonction updateOperation non disponible");
      toast.error("Fonction de modification non disponible");
    }
  };

  const performDeleteOperation = async (): Promise<boolean> => {
    if (!selectedOperation) {
      toast.error("Aucune opération sélectionnée");
      return false;
    }
    setIsDeleting(true);
    try {
      const success = await deleteOperation(selectedOperation);
      if (success) {
        setIsDeleteDialogOpen(false);
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
        toast.error("Erreur lors de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur s'est produite");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferComplete = async () => {
    if (onOperationDeleted) {
      await onOperationDeleted();
    }
  };

  return {
    selectedOperation,
    isDetailsModalOpen,
    isDeleteDialogOpen,
    isTransferDialogOpen,
    isDeleting,
    setIsDetailsModalOpen,
    setIsDeleteDialogOpen,
    setIsTransferDialogOpen,
    handleIdClick,
    handleEditClick,
    handleDeleteClick,
    handleTransferClick,
    handleOperationUpdate,
    performDeleteOperation,
    handleTransferComplete
  };
};
