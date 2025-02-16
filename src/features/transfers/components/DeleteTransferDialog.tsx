
import { type Transfer } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
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

interface DeleteTransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onConfirm: () => void;
}

export const DeleteTransferDialog = ({
  isOpen,
  onOpenChange,
  transfer,
  onConfirm,
}: DeleteTransferDialogProps) => {
  const { currency } = useCurrency();
  
  if (!transfer) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce virement ? Cette action est irréversible.
            <div className="mt-4 p-4 rounded-lg border bg-muted">
              <div className="font-medium">Détails du virement :</div>
              <div className="mt-2 space-y-1 text-sm">
                <p>De : {transfer.fromClient}</p>
                <p>À : {transfer.toClient}</p>
                <p>Montant : {transfer.amount.toLocaleString()} TND</p>
                <p>Date : {transfer.date}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
