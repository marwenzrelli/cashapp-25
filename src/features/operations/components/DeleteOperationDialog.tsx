
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
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { formatDateTime } from "../types";
import { Loader2 } from "lucide-react";

interface DeleteOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
  operation: Operation | null;
  isLoading?: boolean;
}

export function DeleteOperationDialog({
  isOpen,
  onClose,
  onDelete,
  operation,
  isLoading = false
}: DeleteOperationDialogProps) {
  if (!operation) return null;

  // Déterminer le type d'opération en français
  const getOperationTypeText = () => {
    switch (operation.type) {
      case 'deposit':
        return 'ce versement';
      case 'withdrawal':
        return 'ce retrait';
      case 'transfer':
        return 'ce transfert';
      default:
        return 'cette opération';
    }
  };

  // Formatter la date d'opération pour l'affichage
  const displayDate = operation.operation_date || operation.date;

  const handleConfirmDelete = async () => {
    await onDelete();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer {getOperationTypeText()} ?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Cette action est irréversible et supprimera définitivement {getOperationTypeText()} du{" "}
              {formatDateTime(displayDate)}.
            </p>
            <p className="font-semibold text-destructive">
              ID: {operation.id}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <Button 
            onClick={handleConfirmDelete} 
            variant="destructive" 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
