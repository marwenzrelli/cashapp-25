
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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "../types";
import { toast } from "sonner";

interface DeleteOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  operation?: Operation;
}

export const DeleteOperationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  operation,
}: DeleteOperationDialogProps) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };

    if (open) {
      getCurrentUser();
    }
  }, [open]);

  const handleConfirmDelete = async () => {
    // Si c'est un virement, on enregistre dans le log avant la suppression
    if (operation && operation.type === "transfer") {
      try {
        // Récupérer les détails complets du virement
        const { data: transferData, error: transferError } = await supabase
          .from('transfers')
          .select('*')
          .eq('id', operation.id)
          .single();
        
        if (transferError) {
          console.error("Erreur lors de la récupération du virement:", transferError);
        } else if (transferData && userId) {
          // Enregistrer dans la table de log
          const { error: logError } = await supabase
            .from('deleted_transfers_log')
            .insert({
              original_id: transferData.id,
              from_client: transferData.from_client,
              to_client: transferData.to_client,
              amount: transferData.amount,
              reason: transferData.reason,
              operation_date: transferData.operation_date,
              deleted_by: userId,
              deleted_at: new Date().toISOString()
            });
          
          if (logError) {
            console.error("Erreur lors de l'enregistrement du log de suppression:", logError);
            // Ne pas bloquer la suppression si l'enregistrement du log échoue
          }
        }
      } catch (error) {
        console.error("Erreur lors du processus de journalisation:", error);
      }
    }
    
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
