
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useClientWithdrawal(clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleWithdrawal = async (withdrawal: any, isEditing: boolean = false, withdrawalId?: number | string) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      if (isEditing && withdrawalId) {
        // Convert ID to number if it's a string
        const numericId = typeof withdrawalId === 'string' ? parseInt(withdrawalId, 10) : withdrawalId;
        
        // Update existing withdrawal
        const {
          data: updatedWithdrawal,
          error
        } = await supabase.from('withdrawals').update({
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          operation_date: new Date(withdrawal.date).toISOString(),
          notes: withdrawal.notes,
          last_modified_at: new Date().toISOString()
        }).eq('id', numericId).select();
        
        if (error) {
          console.error("Error updating withdrawal:", error);
          toast.error("Error updating withdrawal", {
            description: error.message
          });
          return false;
        }
        
        toast.success("Withdrawal updated", {
          description: `The withdrawal of ${withdrawal.amount} TND for ${withdrawal.client_name} has been updated`
        });
      } else {
        // Insert new withdrawal
        const {
          data: insertedWithdrawal,
          error
        } = await supabase.from('withdrawals').insert({
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          operation_date: new Date(withdrawal.date).toISOString(),
          notes: withdrawal.notes,
          created_by: session?.user?.id
        }).select();
        
        if (error) {
          console.error("Error creating withdrawal:", error);
          toast.error("Error creating withdrawal", {
            description: error.message
          });
          return false;
        }
        
        toast.success("Withdrawal completed", {
          description: `A withdrawal of ${withdrawal.amount} TND has been made for ${withdrawal.client_name}`
        });
      }
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
      // Call update function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Error during withdrawal:", error);
      toast.error("Error processing withdrawal");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const deleteWithdrawal = async (withdrawalId: number | string) => {
    setIsProcessing(true);
    try {
      console.log("Début de la suppression du retrait avec ID:", withdrawalId);
      
      // Convert ID to number if it's a string
      const numericId = typeof withdrawalId === 'string' ? parseInt(withdrawalId, 10) : withdrawalId;
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.error("Utilisateur non authentifié");
        toast.error("Vous devez être connecté pour supprimer un retrait");
        return false;
      }
      
      // Récupérer les détails complets du retrait avant suppression
      const { data: withdrawalData, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', numericId)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du retrait:", fetchError);
        toast.error("Erreur lors de la récupération des détails du retrait", {
          description: fetchError.message
        });
        return false;
      }
      
      if (!withdrawalData) {
        console.error("Aucune donnée de retrait trouvée pour l'ID:", numericId);
        toast.error("Retrait introuvable", {
          description: "Impossible de trouver les détails du retrait à supprimer."
        });
        return false;
      }
      
      console.log("Données du retrait récupérées:", withdrawalData);
      
      // Préparer les données à insérer dans deleted_withdrawals
      const logEntry = {
        original_id: withdrawalData.id,
        client_name: withdrawalData.client_name,
        amount: Number(withdrawalData.amount),
        operation_date: withdrawalData.operation_date || withdrawalData.created_at,
        notes: withdrawalData.notes || null,
        deleted_by: userId,
        status: withdrawalData.status
      };
      
      console.log("Préparation de l'enregistrement dans deleted_withdrawals:", logEntry);
      
      // Insérer dans la table des retraits supprimés
      const { data: logData, error: logError } = await supabase
        .from('deleted_withdrawals')
        .insert(logEntry)
        .select();
        
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", logError);
        toast.error("Erreur lors de l'archivage du retrait", {
          description: logError.message
        });
        return false;
      }
      
      console.log("Enregistrement dans deleted_withdrawals réussi:", logData);
      
      // Delete withdrawal
      const { error: deleteError } = await supabase
        .from('withdrawals')
        .delete()
        .eq('id', numericId);
      
      if (deleteError) {
        console.error("Erreur lors de la suppression du retrait:", deleteError);
        toast.error("Erreur lors de la suppression du retrait", {
          description: deleteError.message
        });
        return false;
      }
      
      console.log("Retrait supprimé avec succès");
      toast.success("Retrait supprimé", {
        description: "Le retrait a été supprimé avec succès"
      });
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
      // Call update function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la suppression du retrait:", error);
      toast.error("Erreur lors de la suppression", {
        description: error.message || "Une erreur s'est produite lors de la suppression du retrait."
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const invalidateQueries = (id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', id] });
    }
  };
  
  return {
    isProcessing,
    handleWithdrawal,
    deleteWithdrawal
  };
}
