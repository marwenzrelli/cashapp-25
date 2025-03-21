
import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DeleteDepositDialogProps } from "@/features/deposits/types";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export const DeleteDepositDialog: React.FC<DeleteDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  onConfirm
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Add effect to log when the component receives a new selected deposit
  useEffect(() => {
    if (selectedDeposit) {
      console.log("DeleteDepositDialog received deposit:", selectedDeposit);
    }
  }, [selectedDeposit]);

  const handleConfirm = async () => {
    if (!onConfirm) {
      console.error("No onConfirm handler provided");
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: "Aucun gestionnaire de suppression n'a été fourni"
      });
      return;
    }
    
    if (!selectedDeposit) {
      console.error("No deposit selected for deletion");
      toast({
        variant: "destructive",
        title: "Aucun versement sélectionné",
        description: "Veuillez sélectionner un versement à supprimer"
      });
      return;
    }
    
    console.log("Starting deposit deletion process for ID:", selectedDeposit.id);
    setIsDeleting(true);
    
    try {
      const result = await onConfirm();
      console.log("Deletion result:", result);
      
      if (result === true) {
        // Close the dialog after successful deletion
        onOpenChange(false);
        toast({
          title: "Versement supprimé avec succès",
          description: `Le versement de ${selectedDeposit.amount} TND a été supprimé et archivé.`
        });
      } else {
        throw new Error("La suppression n'a pas pu être effectuée");
      }
    } catch (error) {
      console.error("Error occurred during deletion:", error);
      toast({
        variant: "destructive",
        title: "Erreur lors de la suppression",
        description: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce versement {selectedDeposit ? `de ${selectedDeposit.amount} TND pour ${selectedDeposit.client_name}` : ''}? 
            Cette action ne peut pas être annulée, mais le versement sera archivé pour référence.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
