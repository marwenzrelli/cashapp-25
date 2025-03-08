import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the deletion of a deposit operation
 * 
 * @param id The ID of the deposit to delete
 * @param userId The ID of the user performing the deletion
 */
export async function handleDepositDeletion(id: string | number, userId: string | undefined) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  try {
    const { data: depositData, error: depositFetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', numericId)
      .single();
      
    if (depositFetchError) {
      console.error("Erreur lors de la récupération du versement:", depositFetchError);
      throw depositFetchError;
    } else if (depositData) {
      console.log("Enregistrement dans deleted_deposits du versement:", depositData);
      
      try {
        const { data: depositLogData, error: depositLogError } = await supabase
          .from('deleted_deposits')
          .insert([{  // Utilisez un tableau pour l'insertion
            original_id: depositData.id,
            client_name: depositData.client_name,
            amount: Number(depositData.amount),
            operation_date: depositData.operation_date || depositData.created_at,
            notes: depositData.notes || null,
            deleted_by: userId,
            status: depositData.status
          }])
          .select();
        
        if (depositLogError) {
          console.error("Erreur lors de l'enregistrement dans deleted_deposits:", depositLogError);
          console.error("Détails de l'erreur:", depositLogError.message, depositLogError.details);
          console.warn("Impossible d'archiver le versement, mais tentative de suppression quand même");
        } else {
          console.log("Versement enregistré avec succès dans deleted_deposits:", depositLogData);
        }
      } catch (logError) {
        console.error("Exception lors de l'archivage:", logError);
        // Continue with the deletion even if archiving fails
      }
      
      // Now proceed with the actual deletion
      const { error: depositError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', numericId);
        
      if (depositError) {
        console.error("Erreur lors de la suppression du versement:", depositError);
        throw depositError;
      }
      
      console.log("Versement supprimé avec succès");
    }
  } catch (error) {
    console.error("Erreur dans handleDepositDeletion:", error);
    throw error;
  }
}

/**
 * Handles the deletion of a withdrawal operation
 * 
 * @param id The ID of the withdrawal to delete
 * @param userId The ID of the user performing the deletion
 */
export async function handleWithdrawalDeletion(id: string | number, userId: string | undefined) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  const { data: withdrawalData, error: withdrawalFetchError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', numericId)
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
      .eq('id', numericId);
      
    if (withdrawalError) {
      console.error("Erreur lors de la suppression du retrait:", withdrawalError);
      throw withdrawalError;
    }
    
    console.log("Retrait supprimé avec succès");
  }
}

/**
 * Handles the deletion of a transfer operation
 * 
 * @param id The ID of the transfer to delete
 * @param userId The ID of the user performing the deletion
 */
export async function handleTransferDeletion(id: string | number, userId: string | undefined) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  const { data: transferData, error: transferFetchError } = await supabase
    .from('transfers')
    .select('*')
    .eq('id', numericId)
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
      .eq('id', numericId);
      
    if (transferError) {
      console.error("Erreur lors de la suppression du virement:", transferError);
      throw transferError;
    }
    
    console.log("Virement supprimé avec succès");
  }
}
