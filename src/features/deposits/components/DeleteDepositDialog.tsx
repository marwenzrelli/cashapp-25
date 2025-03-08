
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { type DeleteDepositDialogProps } from "../types";
import { useState, useEffect } from "react";

export const DeleteDepositDialog = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm,
}: DeleteDepositDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(isOpen);
  
  // Sync internal state with external prop
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // Handle dialog closing internally
  const handleOpenChange = (open: boolean) => {
    if (isDeleting) return; // Don't allow closing while deleting
    
    setInternalOpen(open);
    if (!open) {
      // Only propagate close events to parent
      onOpenChange(false);
    }
  };

  const handleConfirm = async () => {
    if (isDeleting) return; // Prevent double submission
    
    setIsDeleting(true);
    try {
      console.log("DeleteDepositDialog: Démarrage de la suppression");
      const success = await onConfirm();
      
      console.log("DeleteDepositDialog: Résultat de la suppression:", success);
      
      if (success) {
        console.log("DeleteDepositDialog: Suppression réussie, fermeture du dialogue");
        // Force close using internal state first
        setInternalOpen(false);
        // Then notify parent
        setTimeout(() => onOpenChange(false), 50);
      }
    } catch (error) {
      console.error("DeleteDepositDialog: Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog 
      open={internalOpen} 
      onOpenChange={handleOpenChange}
    >
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
            {selectedDeposit && (
              <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                Versement de {selectedDeposit.amount} TND pour {selectedDeposit.client_name}
              </div>
            )}
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent the default action
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
