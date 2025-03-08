
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
import { formatId } from "@/utils/formatId";
import { Deposit } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DeleteDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  onConfirm: () => Promise<boolean>;
}

export const DeleteDepositDialog = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm,
}: DeleteDepositDialogProps) => {
  const { formatCurrency } = useCurrency();
  
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const success = await onConfirm();
      if (success) {
        // Dialog will be closed by the parent component after successful deletion
        console.log("Deletion successful, dialog should close");
      }
    } catch (error) {
      console.error("Error during deposit deletion confirmation:", error);
    }
  };

  if (!selectedDeposit) return null;

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
            <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground space-y-1">
              <p><strong>ID:</strong> {formatId(selectedDeposit.id)}</p>
              <p><strong>Client:</strong> {selectedDeposit.client_name}</p>
              <p><strong>Montant:</strong> {formatCurrency(selectedDeposit.amount)}</p>
              <p><strong>Date:</strong> {selectedDeposit.date || new Date(selectedDeposit.created_at).toLocaleDateString()}</p>
            </div>
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
