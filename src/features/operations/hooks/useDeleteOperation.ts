
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "../types";
import { toast } from "sonner";

export const useDeleteOperation = (
  fetchAllOperations: () => Promise<void>,
  setIsLoading: (isLoading: boolean) => void
) => {
  const deleteOperation = async (operation: Operation) => {
    const operationToDelete = operation;
    return operationToDelete;
  };

  const confirmDeleteOperation = async (operationToDelete: Operation | undefined) => {
    if (!operationToDelete) return;
    
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log(`Début de la suppression de l'opération: ${operationToDelete.type} avec l'ID: ${operationToDelete.id}`);
      console.log("Type de l'ID:", typeof operationToDelete.id);
      
      switch (operationToDelete.type) {
        case "deposit":
          await handleDepositDeletion(operationToDelete.id, userId);
          break;
          
        case "withdrawal":
          await handleWithdrawalDeletion(operationToDelete.id, userId);
          break;
          
        case "transfer":
          await handleTransferDeletion(operationToDelete.id, userId);
          break;
      }
      
      toast.success("Opération supprimée avec succès");
      await fetchAllOperations();
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'opération:", error);
      toast.error("Erreur lors de la suppression de l'opération", {
        description: error.message || "Une erreur s'est produite lors de la suppression."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteOperation,
    confirmDeleteOperation
  };
};

// Helper functions for deletion operations
async function handleDepositDeletion(id: string, userId: string | undefined) {
  const { data: depositData, error: depositFetchError } = await supabase
    .from('deposits')
    .select('*')
    .eq('id', parseInt(id.toString()))
    .single();
    
  if (depositFetchError) {
    console.error("Erreur lors de la récupération du versement:", depositFetchError);
    throw depositFetchError;
  } else if (depositData) {
    console.log("Enregistrement dans deleted_deposits du versement:", depositData);
    
    const { data: depositLogData, error: depositLogError } = await supabase
      .from('deleted_deposits')
      .insert({
        original_id: depositData.id,
        client_name: depositData.client_name,
        amount: Number(depositData.amount),
        operation_date: depositData.operation_date,
        notes: depositData.notes || null,
        deleted_by: userId,
        status: depositData.status
      })
      .select();
    
    if (depositLogError) {
      console.error("Erreur lors de l'enregistrement dans deleted_deposits:", depositLogError);
      throw depositLogError;
    } else {
      console.log("Versement enregistré avec succès dans deleted_deposits:", depositLogData);
    }
    
    const { error: depositError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', parseInt(id.toString()));
      
    if (depositError) {
      console.error("Erreur lors de la suppression du versement:", depositError);
      throw depositError;
    }
    
    console.log("Versement supprimé avec succès");
  }
}

async function handleWithdrawalDeletion(id: string, userId: string | undefined) {
  const { data: withdrawalData, error: withdrawalFetchError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .single();
    
  if (withdrawalFetchError) {
    console.error("Erreur lors de la récupération du retrait:", withdrawalFetchError);
    throw withdrawalFetchError;
  } else if (withdrawalData) {
    console.log("Enregistrement dans deleted_withdrawals du retrait:", withdrawalData);
    
    const { data: withdrawalLogData, error: withdrawalLogError } = await supabase
      .from('deleted_withdrawals')
      .insert({
        original_id: withdrawalData.id,
        client_name: withdrawalData.client_name,
        amount: Number(withdrawalData.amount),
        operation_date: withdrawalData.operation_date,
        notes: withdrawalData.notes || null,
        deleted_by: userId,
        status: withdrawalData.status
      })
      .select();
    
    if (withdrawalLogError) {
      console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", withdrawalLogError);
      throw withdrawalLogError;
    } else {
      console.log("Retrait enregistré avec succès dans deleted_withdrawals:", withdrawalLogData);
    }
    
    const { error: withdrawalError } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', id);
      
    if (withdrawalError) {
      console.error("Erreur lors de la suppression du retrait:", withdrawalError);
      throw withdrawalError;
    }
    
    console.log("Retrait supprimé avec succès");
  }
}

async function handleTransferDeletion(id: string, userId: string | undefined) {
  const { data: transferData, error: transferFetchError } = await supabase
    .from('transfers')
    .select('*')
    .eq('id', id)
    .single();
    
  if (transferFetchError) {
    console.error("Erreur lors de la récupération du virement:", transferFetchError);
    throw transferFetchError;
  } else if (transferData) {
    console.log("Enregistrement dans deleted_transfers du virement:", transferData);
    
    const { data: transferLogData, error: transferLogError } = await supabase
      .from('deleted_transfers')
      .insert({
        original_id: transferData.id,
        from_client: transferData.from_client,
        to_client: transferData.to_client,
        amount: Number(transferData.amount),
        operation_date: transferData.operation_date,
        reason: transferData.reason,
        deleted_by: userId,
        status: transferData.status
      })
      .select();
    
    if (transferLogError) {
      console.error("Erreur lors de l'enregistrement dans deleted_transfers:", transferLogError);
      throw transferLogError;
    } else {
      console.log("Virement enregistré avec succès dans deleted_transfers:", transferLogData);
    }
    
    const { error: transferError } = await supabase
      .from('transfers')
      .delete()
      .eq('id', id);
      
    if (transferError) {
      console.error("Erreur lors de la suppression du virement:", transferError);
      throw transferError;
    }
    
    console.log("Virement supprimé avec succès");
  }
}
