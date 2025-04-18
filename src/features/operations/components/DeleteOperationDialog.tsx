
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
  onConfirm: () => Promise<void>;
  operation: Operation | null;
  // Support for both naming conventions - this makes the component more flexible
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
      // Use onDelete if provided, otherwise fall back to onConfirm
      if (onDelete) {
        const success = await onDelete();
        if (success) {
          toast.success("Opération supprimée avec succès");
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } else {
        await onConfirm();
        toast.success("Opération supprimée avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      onClose();
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
