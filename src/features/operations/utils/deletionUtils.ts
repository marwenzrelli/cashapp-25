
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the deletion of a deposit operation
 * 
 * @param id The ID of the deposit to delete
 * @param userId The ID of the user performing the deletion
 * @returns Promise resolving to true on successful deletion
 */
export async function handleDepositDeletion(id: string | number, userId: string | undefined): Promise<boolean> {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  try {
    console.log(`Suppression du versement ID: ${numericId}, par l'utilisateur ${userId || 'anonyme'}`);
    
    // Récupérer les détails du versement avant suppression pour l'archiver
    const { data: depositData, error: depositFetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', numericId)
      .single();
      
    if (depositFetchError) {
      console.error("Erreur lors de la récupération du versement:", depositFetchError);
      throw depositFetchError;
    }
    
    if (!depositData) {
      console.error(`Aucun versement trouvé avec l'ID ${numericId}`);
      return false;
    }
    
    console.log("Dépôt trouvé, archivage dans deleted_deposits:", depositData);
    
    // Créer une entrée dans deleted_deposits pour conserver l'historique
    const { error: depositLogError } = await supabase
      .from('deleted_deposits')
      .insert({
        original_id: depositData.id,
        client_name: depositData.client_name,
        amount: Number(depositData.amount),
        operation_date: depositData.operation_date || depositData.created_at,
        notes: depositData.notes || null,
        deleted_by: userId,
        status: depositData.status
      });
    
    if (depositLogError) {
      console.error("Erreur lors de l'archivage du versement:", depositLogError);
      console.error("Détails:", depositLogError.message, depositLogError.details);
      // Ne pas interrompre la suppression si l'archivage échoue
      console.warn("L'archivage a échoué, mais nous continuons avec la suppression");
    } else {
      console.log("Versement archivé avec succès dans deleted_deposits");
    }
    
    // Supprimer le versement original
    const { error: deleteError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', numericId);
      
    if (deleteError) {
      console.error("Erreur lors de la suppression du versement:", deleteError);
      throw deleteError;
    }
    
    console.log(`Versement ID: ${numericId} supprimé avec succès`);
    return true;
  } catch (error) {
    console.error("Erreur dans handleDepositDeletion:", error);
    return false; // Return false instead of rethrowing to allow proper handling by calling functions
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
