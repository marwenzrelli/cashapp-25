
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { DeleteDepositDialogProps } from "@/features/deposits/types";
import { toast } from "sonner";
import { useDepositDeletion } from "@/features/deposits/hooks/deposit-hooks/useDepositDeletion";

export const DeleteDepositDialog: React.FC<DeleteDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteDepositDirectly } = useDepositDeletion();
  
  const handleConfirm = async () => {
    if (!selectedDeposit) {
      console.error("No deposit selected for deletion");
      toast.error("Aucun versement sélectionné");
      return;
    }
    
    console.log("[DIALOG] Starting deletion process for deposit:", selectedDeposit);
    setIsDeleting(true);
    
    try {
      console.log("[DIALOG] Calling deleteDepositDirectly");
      const success = await deleteDepositDirectly(selectedDeposit);
      
      console.log("[DIALOG] Deletion result:", success);
      
      if (success === true) {
        console.log("[DIALOG] Deletion successful, closing dialog");
        onOpenChange(false);
        
        // Call the parent's onConfirm to update the UI
        if (onConfirm) {
          await onConfirm();
        }
      } else {
        console.error("[DIALOG] Deletion failed");
        toast.error("La suppression a échoué");
      }
    } catch (error) {
      console.error("[DIALOG] Error during deletion:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!selectedDeposit) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Êtes-vous sûr de vouloir supprimer ce versement ?</p>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="font-medium text-foreground">
                Client : {selectedDeposit.client_name}
              </div>
              <div className="text-sm text-muted-foreground">
                Montant : {selectedDeposit.amount.toLocaleString()} TND
              </div>
              <div className="text-sm text-muted-foreground">
                Date : {selectedDeposit.date}
              </div>
              <div className="text-sm text-muted-foreground">
                ID : #{selectedDeposit.id}
              </div>
            </div>
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
