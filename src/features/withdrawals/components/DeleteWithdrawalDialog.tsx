
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
import { formatId } from "@/utils/formatId";
import { Withdrawal } from "../types";
import { formatAmount } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";

interface DeleteWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  withdrawal: Withdrawal | null;
}

export const DeleteWithdrawalDialog: React.FC<DeleteWithdrawalDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  withdrawal,
}) => {
  if (!withdrawal) {
    return null;
  }

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    const success = await onConfirm();
    // No need to manually close the dialog here as it's now handled in the hook
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce retrait?
            <div className="my-4 p-4 border rounded-lg bg-muted">
              <p>
                <strong>ID:</strong> {formatId(withdrawal.id, 4)}
              </p>
              <p>
                <strong>Client:</strong> {withdrawal.client_name}
              </p>
              <p>
                <strong>Montant:</strong> {formatAmount(withdrawal.amount, "TND")}
              </p>
              <p>
                <strong>Date:</strong> {withdrawal.date}
              </p>
            </div>
            Cette action est irréversible et supprimera définitivement le retrait de la base de données.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
