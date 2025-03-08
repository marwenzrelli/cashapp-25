
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

export const DeleteDepositDialog = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm,
}: DeleteDepositDialogProps) => {
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
            {selectedDeposit && (
              <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                Versement de {selectedDeposit.amount} TND
              </div>
            )}
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              // Ne pas fermer le modal ici, car il sera fermé dans la fonction de confirmation
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
