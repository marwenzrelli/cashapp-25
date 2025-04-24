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
import { Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [internalLoading, setInternalLoading] = useState(false);
  const effectiveLoading = isLoading || internalLoading;
  
  useEffect(() => {
    setInternalLoading(false);
  }, [isOpen]);
  
  if (!operation) return null;

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

  const displayDate = operation.operation_date || operation.date;

  const handleConfirmDelete = async () => {
    try {
      console.log("Confirmation de suppression pour l'opération:", operation.id, "de type:", operation.type);
      console.log("Type de l'ID:", typeof operation.id);
      
      setInternalLoading(true);
      
      const result = await onDelete();
      
      console.log("Résultat de la suppression:", result);
      
      if (result) {
        console.log("Suppression réussie, fermeture de la boite de dialogue");
      } else {
        console.error("Échec de la suppression");
        toast.error("Échec de la suppression");
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      // Garder l'état de chargement jusqu'à ce que le dialogue soit fermé par le parent
      // setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            Êtes-vous sûr de vouloir supprimer {getOperationTypeText()} ?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Cette action est irréversible et supprimera définitivement {getOperationTypeText()} du{" "}
              {formatDateTime(displayDate)}.
            </p>
            <p className="font-semibold text-destructive">
              ID: {operation.id} (Type: {operation.type})
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={effectiveLoading}>Annuler</AlertDialogCancel>
          <Button 
            onClick={handleConfirmDelete} 
            variant="destructive" 
            disabled={effectiveLoading}
            className="flex items-center gap-2"
          >
            {effectiveLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {effectiveLoading ? "Suppression en cours..." : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
