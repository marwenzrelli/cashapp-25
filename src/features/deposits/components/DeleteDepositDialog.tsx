
import React from "react";
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
import { Trash2 } from "lucide-react";
import { DeleteDepositDialogProps } from "@/features/deposits/types";
import { toast } from "sonner";
import { formatId } from "@/utils/formatId";

export const DeleteDepositDialog: React.FC<DeleteDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    console.log("=== DeleteDialog State ===");
    console.log("Dialog ouvert:", isOpen);
    console.log("Versement sélectionné:", selectedDeposit);
    console.log("Fonction onConfirm disponible:", !!onConfirm);
  }, [isOpen, selectedDeposit, onConfirm]);

  const handleConfirm = async () => {
    console.log("=== Début handleConfirm dans DeleteDialog ===");
    
    if (!onConfirm) {
      console.error("Aucune fonction onConfirm fournie");
      toast.error("Erreur de configuration du dialog");
      return;
    }
    
    if (!selectedDeposit) {
      console.error("Aucun versement sélectionné");
      toast.error("Aucun versement sélectionné");
      return;
    }

    console.log("Versement à supprimer:", {
      id: selectedDeposit.id,
      client_name: selectedDeposit.client_name,
      amount: selectedDeposit.amount
    });
    
    setIsDeleting(true);
    
    try {
      console.log("Appel de la fonction onConfirm");
      const success = await onConfirm();
      console.log("Résultat de onConfirm:", success);
      
      if (success === true) {
        console.log("Suppression réussie - fermeture du dialog");
        onOpenChange(false);
      } else {
        console.error("La suppression a échoué");
        toast.error("La suppression a échoué");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      console.log("=== Fin handleConfirm dans DeleteDialog ===");
    }
  };

  // Fonction utilitaire pour l'affichage de l'ID
  const displayId = (deposit?: any) => {
    if (!deposit || deposit.id === undefined || deposit.id === null) {
      return "N/A";
    }
    return formatId(deposit.id, 6);
  };

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
            {selectedDeposit && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="font-medium text-foreground">
                  Client : {selectedDeposit.client_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold pr-1">ID du versement :</span> 
                  {displayId(selectedDeposit)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Montant : {typeof selectedDeposit.amount === "number"
                    ? selectedDeposit.amount.toLocaleString() + " TND"
                    : selectedDeposit.amount ?? "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Date : {selectedDeposit.date || selectedDeposit.operation_date || "N/A"}
                </div>
              </div>
            )}
            <p className="text-destructive font-medium">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isDeleting || !selectedDeposit}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
