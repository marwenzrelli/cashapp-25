
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
    if (!operation) {
      console.error("Opération non définie");
      return onConfirm();
    }
    
    try {
      // Traitement spécifique selon le type d'opération
      if (operation.type === "deposit") {
        // Récupérer les détails complets du versement
        const { data: depositData, error: fetchError } = await supabase
          .from('deposits')
          .select('*')
          .eq('id', parseInt(operation.id))
          .single();
        
        if (fetchError) {
          console.error("Erreur lors de la récupération du versement:", fetchError);
        } else if (depositData && userId) {
          console.log("Enregistrement dans deleted_transfers_log du versement:", depositData);
          
          // Enregistrer dans la table de log
          const { error: logError } = await supabase
            .from('deleted_transfers_log')
            .insert({
              original_id: operation.id,
              operation_type: 'deposit',
              client_name: depositData.client_name,
              amount: depositData.amount,
              operation_date: depositData.operation_date,
              reason: depositData.notes || null,
              from_client: depositData.client_name,
              to_client: depositData.client_name,
              deleted_by: userId,
              deleted_at: new Date().toISOString()
            });
          
          if (logError) {
            console.error("Erreur lors de l'enregistrement du log de suppression du versement:", logError);
          } else {
            console.log("Versement enregistré avec succès dans deleted_transfers_log");
          }
        }
      } else if (operation.type === "withdrawal") {
        // Récupérer les détails complets du retrait
        const { data: withdrawalData, error: fetchError } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('id', operation.id)
          .single();
        
        if (fetchError) {
          console.error("Erreur lors de la récupération du retrait:", fetchError);
        } else if (withdrawalData && userId) {
          console.log("Enregistrement dans deleted_transfers_log du retrait:", withdrawalData);
          
          // Enregistrer dans la table de log
          const { error: logError } = await supabase
            .from('deleted_transfers_log')
            .insert({
              original_id: operation.id,
              operation_type: 'withdrawal',
              client_name: withdrawalData.client_name,
              amount: withdrawalData.amount,
              operation_date: withdrawalData.operation_date,
              reason: withdrawalData.notes || null,
              from_client: withdrawalData.client_name,
              to_client: withdrawalData.client_name,
              deleted_by: userId,
              deleted_at: new Date().toISOString()
            });
          
          if (logError) {
            console.error("Erreur lors de l'enregistrement du log de suppression du retrait:", logError);
          } else {
            console.log("Retrait enregistré avec succès dans deleted_transfers_log");
          }
        }
      } else if (operation.type === "transfer") {
        // Récupérer les détails complets du virement
        const { data: transferData, error: transferError } = await supabase
          .from('transfers')
          .select('*')
          .eq('id', operation.id)
          .single();
        
        if (transferError) {
          console.error("Erreur lors de la récupération du virement:", transferError);
        } else if (transferData && userId) {
          console.log("Enregistrement dans deleted_transfers_log du virement:", transferData);
          
          // Enregistrer dans la table de log
          const { error: logError } = await supabase
            .from('deleted_transfers_log')
            .insert({
              original_id: transferData.id,
              operation_type: 'transfer',
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
          } else {
            console.log("Virement enregistré avec succès dans deleted_transfers_log");
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du processus de journalisation:", error);
      toast.error("Erreur lors de l'enregistrement de la suppression dans les logs");
    }
    
    // Appeler la fonction de confirmation de suppression, même si l'enregistrement du log échoue
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
