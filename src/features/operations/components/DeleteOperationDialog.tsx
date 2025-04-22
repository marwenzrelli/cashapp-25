
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { toast } from "sonner";

interface DeleteOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void>;
  operation: Operation | null;
  // Support for both naming conventions and return types
  onDelete?: () => Promise<boolean>;
}

export function DeleteOperationDialog({
  isOpen,
  onClose,
  onConfirm,
  operation,
  onDelete,
}: DeleteOperationDialogProps) {
  if (!operation) return null;

  const handleDelete = async () => {
    try {
      console.log("Tentative de suppression de l'opération:", operation.id);
      
      // Use onDelete if provided, otherwise fall back to onConfirm
      if (onDelete) {
        console.log("Appel de la fonction onDelete");
        const success = await onDelete();
        
        if (success) {
          console.log("Suppression réussie via onDelete");
          // Le toast est maintenant géré dans useOperations pour éviter les notifications en double
          onClose(); // Fermer le dialogue après succès
        } else {
          console.error("Échec de la suppression via onDelete");
          toast.error("Erreur lors de la suppression");
        }
      } else if (onConfirm) {
        console.log("Appel de la fonction onConfirm");
        await onConfirm();
        console.log("Suppression réussie via onConfirm");
        // Le toast est maintenant géré dans useOperations pour éviter les notifications en double
        onClose(); // Fermer le dialogue après succès
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'opération</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette opération ? Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
