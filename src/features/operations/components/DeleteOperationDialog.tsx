
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { Loader2 } from "lucide-react";

interface DeleteOperationDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string | number) => Promise<boolean>;
}

export const DeleteOperationDialog = ({
  operation,
  isOpen,
  onClose,
  onDelete
}: DeleteOperationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!operation) return;
    
    setIsDeleting(true);
    
    try {
      // Nous utilisons l'ID tel quel, sans tenter de créer un nouvel enregistrement dans le journal
      // La journalisation est maintenant gérée exclusivement dans les hooks spécifiques (useDeposits, etc.)
      const success = await onDelete(operation.id);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!operation) return null;

  const getOperationTypeLabel = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "versement";
      case "withdrawal":
        return "retrait";
      case "transfer":
        return "virement";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement ce {getOperationTypeLabel(operation.type)} ?
            Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium">{operation.id}</span>
            
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">{getOperationTypeLabel(operation.type)}</span>
            
            <span className="text-muted-foreground">Montant:</span>
            <span className="font-medium">{operation.amount.toLocaleString()} €</span>
            
            <span className="text-muted-foreground">Description:</span>
            <span className="font-medium truncate">{operation.description}</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="destructive" 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
