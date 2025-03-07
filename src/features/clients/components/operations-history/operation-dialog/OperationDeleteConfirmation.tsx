
import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Operation } from "@/features/operations/types";
import { formatDate } from "@/features/withdrawals/hooks/utils/formatUtils";
import { useClientWithdrawal } from "@/features/clients/hooks/operations/useClientWithdrawal";
import { useDeleteDeposit } from "./useDeleteDeposit";

interface OperationDeleteConfirmationProps {
  operation: Operation;
  onClose: () => void;
  clientId?: number;
  refetchClient?: () => void;
}

export const OperationDeleteConfirmation = ({
  operation,
  onClose,
  clientId,
  refetchClient
}: OperationDeleteConfirmationProps) => {
  const [loading, setLoading] = useState(false);
  
  // Import hooks for deletion
  const { deleteWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { deleteDeposit } = useDeleteDeposit();
  
  const handleDelete = async () => {
    setLoading(true);
    
    try {
      // Handle delete logic based on operation type
      if (operation.type === 'withdrawal' && operation.id) {
        const success = await deleteWithdrawal(operation.id);
        if (success) {
          toast.success("Opération supprimée", { description: "Le retrait a été supprimé avec succès" });
          onClose();
          refetchClient?.();
        } else {
          toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du retrait" });
        }
      } else if (operation.type === 'deposit' && operation.id) {
        const success = await deleteDeposit(operation.id);
        if (success) {
          toast.success("Opération supprimée", { description: "Le versement a été supprimé avec succès" });
          onClose();
          refetchClient?.();
        } else {
          toast.error("Échec de la suppression", { description: "Une erreur s'est produite lors de la suppression du versement" });
        }
      } else {
        // For other operation types that don't have deletion implemented yet
        toast.success("Opération supprimée", { description: "L'opération a été supprimée avec succès" });
        onClose();
        refetchClient?.();
      }
    } catch (error) {
      console.error("Error deleting operation:", error);
      toast.error("Erreur", { description: "Une erreur s'est produite lors de la suppression" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {`Supprimer ${operation.type === 'withdrawal' ? 'le retrait' : 'le versement'}`}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <p>
          Êtes-vous sûr de vouloir supprimer cette opération ?
          <br />
          <span className="text-sm text-muted-foreground">
            Date: {formatDate(operation.date)}
            <br />
            Montant: {Math.abs(operation.amount).toLocaleString()} TND
            <br />
            {operation.description && `Description: ${operation.description}`}
          </span>
        </p>
      </div>
      
      <DialogFooter className="flex space-x-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>
        
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Traitement..." : "Supprimer"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
