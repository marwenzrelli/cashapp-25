
import React from "react";
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
import { Withdrawal } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DeleteWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  withdrawalToDelete: Withdrawal | null;
}

export const DeleteWithdrawalDialog: React.FC<DeleteWithdrawalDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  withdrawalToDelete,
}) => {
  const { currency } = useCurrency();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Êtes-vous sûr de vouloir supprimer ce retrait ?</p>
            {withdrawalToDelete && (
              <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                Retrait de {withdrawalToDelete.amount} {currency}
              </div>
            )}
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
