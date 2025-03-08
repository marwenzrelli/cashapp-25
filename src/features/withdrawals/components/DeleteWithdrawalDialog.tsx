
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
import { Trash2 } from "lucide-react";

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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce retrait?
            <div className="my-4 p-4 border rounded-lg bg-muted">
              <p>
                <strong>ID:</strong> {formatId(withdrawal.id)}
              </p>
              <p>
                <strong>Client:</strong> {withdrawal.client_name}
              </p>
              <p>
                <strong>Montant:</strong> {withdrawal.amount.toLocaleString()} €
              </p>
              <p>
                <strong>Date:</strong> {withdrawal.date}
              </p>
            </div>
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
