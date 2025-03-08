
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
import { useState } from "react";

export const DeleteDepositDialog = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm,
}: DeleteDepositDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (isDeleting) return; // Prevent double submission
    
    setIsDeleting(true);
    try {
      console.log("Démarrage de la suppression du versement dans DeleteDepositDialog");
      const success = await onConfirm();
      
      console.log("Résultat de la suppression:", success);
      
      if (success) {
        console.log("Suppression réussie, fermeture explicite de la boîte de dialogue");
        // Force close the dialog after a successful deletion
        setTimeout(() => onOpenChange(false), 100);
      } else {
        console.error("La suppression a échoué");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (isDeleting) {
          // Don't allow closing during deletion process
          return;
        }
        onOpenChange(open);
      }}
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
              e.preventDefault(); // Prevent the dialog from closing automatically
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
