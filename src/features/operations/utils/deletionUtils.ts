import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Operation } from "../types";

/**
 * Fonction utilitaire qui extrait l'ID numérique d'une opération
 */
export const parseOperationId = (operationId: string | number): number => {
  // Si l'ID est déjà un nombre, le retourner
  if (typeof operationId === 'number') {
    return operationId;
  }
  
  // Convertir en chaîne pour le traitement
  const idString = String(operationId);
  console.log(`Parsing operation ID: ${idString}, type: ${typeof idString}`);
  
  // Pour les IDs de format "withdrawal-123" ou "wit-123"
  if (idString.includes('-')) {
    const parts = idString.split('-');
    const idPart = parts[parts.length - 1];
    console.log(`ID après split: ${idPart}`);
    
    const numericId = parseInt(idPart, 10);
    
    if (isNaN(numericId)) {
      console.error(`Impossible de convertir l'ID en nombre: ${idPart}`);
      throw new Error(`Format d'ID invalide: ${idString}`);
    }
    
    console.log(`ID numérique extrait: ${numericId}`);
    return numericId;
  } 
  // Pour les IDs de format "wit123" (sans tiret)
  else if (idString.match(/^[a-z]+\d+$/i)) {
    // Suppression de tous les caractères non-numériques
    const idPart = idString.replace(/\D/g, '');
    console.log(`ID après extraction numérique: ${idPart}`);
    
    const numericId = parseInt(idPart, 10);
    
    if (isNaN(numericId)) {
      console.error(`Impossible de convertir l'ID en nombre: ${idPart}`);
      throw new Error(`Format d'ID invalide: ${idString}`);
    }
    
    console.log(`ID numérique extrait: ${numericId}`);
    return numericId;
  } 
  // Pour les IDs purement numériques en string
  else {
    const numericId = parseInt(idString, 10);
    
    if (isNaN(numericId)) {
      console.error(`Impossible de convertir l'ID en nombre: ${idString}`);
      throw new Error(`Format d'ID invalide: ${idString}`);
    }
    
    console.log(`ID numérique extrait: ${numericId}`);
    return numericId;
  }
};

/**
 * Fonction générique pour la suppression d'opérations (retrait, dépôt, transfert)
 */
export const deleteOperation = async (operation: Operation): Promise<boolean> => {
  if (!operation) {
    console.error("Aucune opération fournie pour la suppression");
    toast.error("Erreur", { description: "Aucune opération sélectionnée" });
    return false;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      toast.error("Vous devez être connecté pour supprimer une opération");
      throw new Error("Utilisateur non authentifié");
    }
    
    const operationType = operation.type;
    
    // Obtenir un ID numérique à partir de différents formats possibles
    let operationId: number;
    try {
      operationId = parseOperationId(operation.id);
    } catch (error) {
      console.error("Erreur lors du parsing de l'ID:", error);
      toast.error("Format d'ID invalide");
      return false;
    }
    
    console.log(`Suppression d'opération - ID parsé: ${operationId}, type: ${operationType}`);
    
    switch (operationType) {
      case 'withdrawal': 
        return await handleWithdrawalDeletion(operationId, userId);
      case 'deposit':
        return await handleDepositDeletion(operationId, userId);
      case 'transfer':
        return await handleTransferDeletion(operationId, userId);
      default:
        console.error("Type d'opération non supporté:", operationType);
        toast.error(`Type d'opération non supporté: ${operationType}`);
        return false;
    }
  } catch (error: any) {
    console.error("Erreur lors de la suppression:", error);
    toast.error("Erreur de suppression", { 
      description: error.message || "Une erreur s'est produite" 
    });
    return false;
  }
};

/**
 * Utilitaire pour supprimer un dépôt et garder une trace dans deleted_deposits
 */
export const handleDepositDeletion = async (depositId: number, userId: string | undefined): Promise<boolean> => {
  try {
    console.log(`Suppression du dépôt avec ID: ${depositId}`);
    
    if (!depositId || isNaN(depositId) || depositId <= 0) {
      console.error("ID de dépôt invalide:", depositId);
      toast.error("ID de dépôt invalide");
      return false;
    }
    
    // Récupérer les détails du dépôt avant suppression
    const { data: depositData, error: fetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();
      
    if (fetchError) {
      console.error("Erreur lors de la récupération des détails du dépôt:", fetchError);
      toast.error("Erreur lors de la récupération des détails du dépôt");
      throw fetchError;
    }
    
    if (!depositData) {
      console.error("Aucune donnée de dépôt trouvée pour l'ID:", depositId);
      toast.error("Dépôt introuvable");
      return false;
    }
    
    // Préparer les données à insérer dans deleted_deposits
    const logEntry = {
      original_id: depositData.id,
      client_name: depositData.client_name,
      client_id: depositData.client_id,
      amount: Number(depositData.amount),
      operation_date: depositData.operation_date || depositData.created_at,
      notes: depositData.notes || null,
      deleted_by: userId,
      status: depositData.status
    };
    
    // Insérer dans la table des dépôts supprimés
    const { error: logError } = await supabase
      .from('deleted_deposits')
      .insert(logEntry);
      
    if (logError) {
      console.error("Erreur lors de l'enregistrement dans deleted_deposits:", logError);
      throw logError;
    }
    
    // Maintenant supprimer le dépôt original
    const { error: deleteError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', depositId);
      
    if (deleteError) {
      console.error("Erreur lors de la suppression du dépôt:", deleteError);
      toast.error("Erreur lors de la suppression du dépôt", {
        description: deleteError.message
      });
      throw deleteError;
    }
    
    console.log("Dépôt supprimé avec succès:", depositId);
    toast.success("Dépôt supprimé avec succès");
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la suppression du dépôt:", error);
    toast.error("Erreur lors de la suppression", {
      description: error.message || "Une erreur s'est produite lors de la suppression du dépôt."
    });
    return false;
  }
};

/**
 * Utilitaire pour supprimer un retrait et garder une trace dans deleted_withdrawals
 */
export const handleWithdrawalDeletion = async (withdrawalId: number, userId: string | undefined): Promise<boolean> => {
  try {
    console.log(`Suppression du retrait avec ID: ${withdrawalId}`);
    
    if (!withdrawalId || isNaN(withdrawalId) || withdrawalId <= 0) {
      console.error("ID de retrait invalide:", withdrawalId);
      toast.error("ID de retrait invalide");
      return false;
    }
    
    // Récupérer les détails du retrait avant suppression
    const { data: withdrawalData, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();
      
    if (fetchError) {
      console.error("Erreur lors de la récupération des détails du retrait:", fetchError);
      toast.error("Erreur lors de la récupération des détails du retrait");
      throw fetchError;
    }
    
    if (!withdrawalData) {
      console.error("Aucune donnée de retrait trouvée pour l'ID:", withdrawalId);
      toast.error("Retrait introuvable");
      return false;
    }
    
    // Préparer les données à insérer dans deleted_withdrawals
    // Removed client_id from the logEntry since it doesn't exist in the deleted_withdrawals table
    const logEntry = {
      original_id: withdrawalData.id,
      client_name: withdrawalData.client_name,
      amount: Number(withdrawalData.amount),
      operation_date: withdrawalData.operation_date || withdrawalData.created_at,
      notes: withdrawalData.notes || null,
      deleted_by: userId,
      status: withdrawalData.status
    };
    
    // Insérer dans la table des retraits supprimés
    const { error: logError } = await supabase
      .from('deleted_withdrawals')
      .insert(logEntry);
      
    if (logError) {
      console.error("Erreur lors de l'enregistrement dans deleted_withdrawals:", logError);
      throw logError;
    }
    
    // Maintenant supprimer le retrait original
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', withdrawalId);
      
    if (deleteError) {
      console.error("Erreur lors de la suppression du retrait:", deleteError);
      toast.error("Erreur lors de la suppression du retrait", {
        description: deleteError.message
      });
      throw deleteError;
    }
    
    console.log("Retrait supprimé avec succès:", withdrawalId);
    toast.success("Retrait supprimé avec succès");
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la suppression du retrait:", error);
    toast.error("Erreur lors de la suppression", {
      description: error.message || "Une erreur s'est produite lors de la suppression du retrait."
    });
    return false;
  }
};

/**
 * Utilitaire pour supprimer un transfert et restaurer l'opération originale
 */
export const handleTransferDeletion = async (transferId: number, userId: string | undefined): Promise<boolean> => {
  try {
    console.log(`Suppression du transfert avec ID: ${transferId}`);
    
    if (!transferId || isNaN(transferId) || transferId <= 0) {
      console.error("ID de transfert invalide:", transferId);
      toast.error("ID de transfert invalide");
      return false;
    }
    
    // Étape 1: Vérifier si le transfert existe dans la base
    console.log(`Vérification de l'existence du transfert ID: ${transferId}`);
    const { data: transferData, error: fetchError } = await supabase
      .from('transfers')
      .select('*')
      .eq('id', transferId)
      .maybeSingle();
      
    if (fetchError) {
      console.error("Erreur lors de la vérification du transfert:", fetchError);
      toast.error("Erreur lors de la vérification du transfert");
      return false;
    }
    
    // Si le transfert n'existe pas, chercher dans les transferts supprimés
    if (!transferData) {
      console.log(`Transfert ID ${transferId} non trouvé dans la table transfers, vérification dans deleted_transfers...`);
      
      const { data: deletedTransferData } = await supabase
        .from('deleted_transfers')
        .select('*')
        .eq('original_id', transferId)
        .maybeSingle();
      
      if (deletedTransferData) {
        console.log(`Transfert trouvé dans deleted_transfers, tentative de restauration de l'opération originale...`);
        // Essayer de restaurer l'opération originale même si le transfert est déjà supprimé
        const restored = await attemptOriginalOperationRestoration(deletedTransferData.from_client, deletedTransferData.amount, userId);
        if (restored) {
          toast.success("Opération originale restaurée avec succès");
        } else {
          toast.success("Transfert déjà supprimé");
        }
        return true;
      } else {
        console.log("Transfert non trouvé nulle part, considéré comme déjà supprimé");
        toast.success("Transfert déjà supprimé ou introuvable");
        return true;
      }
    }
    
    console.log(`Transfert trouvé: ${transferData.from_client} → ${transferData.to_client}, montant: ${transferData.amount}`);
    
    // Étape 2: Chercher l'opération originale avant suppression du transfert
    console.log(`Recherche de l'opération originale pour ${transferData.from_client}, montant: ${transferData.amount}`);
    const originalOperation = await findOriginalOperation(transferData.from_client, transferData.amount);
    
    // Étape 3: Enregistrer dans deleted_transfers AVANT suppression
    await recordDeletedTransfer(transferData, userId);
    
    // Étape 4: Supprimer le transfert de la table principale
    const { error: deleteError } = await supabase
      .from('transfers')
      .delete()
      .eq('id', transferId);
      
    if (deleteError) {
      console.error("Erreur lors de la suppression du transfert:", deleteError);
      toast.error("Erreur lors de la suppression du transfert", {
        description: deleteError.message
      });
      return false;
    }
    
    console.log(`Transfert supprimé avec succès de la table transfers`);
    
    // Étape 5: Restaurer l'opération originale si trouvée
    if (originalOperation) {
      console.log(`Tentative de restauration de l'opération originale: ${originalOperation.type}`);
      const restored = await restoreOriginalOperation(originalOperation, userId);
      if (restored) {
        toast.success("Transfert supprimé et opération originale restaurée avec succès");
        return true;
      } else {
        console.warn("Échec de la restauration de l'opération originale");
        toast.success("Transfert supprimé (restauration partielle)");
        return true;
      }
    } else {
      console.log("Aucune opération originale trouvée à restaurer");
      toast.success("Transfert supprimé avec succès");
      return true;
    }
    
  } catch (error: any) {
    console.error("Erreur lors de la suppression du transfert:", error);
    toast.error("Erreur lors de la suppression", {
      description: error.message || "Une erreur s'est produite lors de la suppression du transfert."
    });
    return false;
  }
};

/**
 * Cherche l'opération originale (dépôt ou retrait) qui a été transférée
 */
const findOriginalOperation = async (clientName: string, amount: number) => {
  console.log(`Recherche de l'opération originale pour ${clientName}, montant: ${amount}`);
  
  // Chercher dans deleted_deposits (étendre la recherche à 7 jours)
  const { data: deletedDeposit } = await supabase
    .from('deleted_deposits')
    .select('*')
    .eq('client_name', clientName)
    .eq('amount', amount)
    .gte('deleted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('deleted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (deletedDeposit) {
    console.log("Opération originale trouvée: dépôt supprimé", deletedDeposit);
    return { ...deletedDeposit, type: 'deposit' };
  }
  
  // Chercher dans deleted_withdrawals
  const { data: deletedWithdrawal } = await supabase
    .from('deleted_withdrawals')
    .select('*')
    .eq('client_name', clientName)
    .eq('amount', amount)
    .gte('deleted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('deleted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (deletedWithdrawal) {
    console.log("Opération originale trouvée: retrait supprimé", deletedWithdrawal);
    return { ...deletedWithdrawal, type: 'withdrawal' };
  }
  
  console.log("Aucune opération originale trouvée");
  return null;
};

/**
 * Enregistre le transfert supprimé dans deleted_transfers
 */
const recordDeletedTransfer = async (transferData: any, userId: string | undefined) => {
  try {
    const { error: logError } = await supabase
      .from('deleted_transfers')
      .insert({
        original_id: transferData.id,
        from_client: transferData.from_client,
        to_client: transferData.to_client,
        amount: Number(transferData.amount),
        operation_date: transferData.operation_date,
        reason: transferData.reason,
        status: transferData.status,
        deleted_by: userId
      });
      
    if (logError) {
      console.error("Erreur lors de l'enregistrement dans deleted_transfers:", logError);
    } else {
      console.log("Transfert enregistré dans deleted_transfers");
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du transfert supprimé:", error);
  }
};

/**
 * Restaure l'opération originale (dépôt ou retrait)
 */
const restoreOriginalOperation = async (originalOperation: any, userId: string | undefined): Promise<boolean> => {
  try {
    console.log(`Restauration de l'opération ${originalOperation.type} pour ${originalOperation.client_name}`);
    
    if (originalOperation.type === 'deposit') {
      // Restaurer le dépôt
      const { data: restoredDeposit, error: restoreError } = await supabase
        .from('deposits')
        .insert({
          client_name: originalOperation.client_name,
          client_id: originalOperation.client_id || null,
          amount: Number(originalOperation.amount),
          operation_date: originalOperation.operation_date,
          notes: originalOperation.notes,
          status: originalOperation.status || 'completed',
          created_by: userId
        })
        .select()
        .single();
      
      if (restoreError) {
        console.error("Erreur lors de la restauration du dépôt:", restoreError);
        return false;
      } else {
        console.log("Dépôt restauré avec succès:", restoredDeposit);
        
        // Supprimer l'entrée de deleted_deposits
        const { error: deleteLogError } = await supabase
          .from('deleted_deposits')
          .delete()
          .eq('id', originalOperation.id);
        
        if (deleteLogError) {
          console.warn("Erreur lors de la suppression de l'entrée deleted_deposits:", deleteLogError);
        }
        
        return true;
      }
    } else if (originalOperation.type === 'withdrawal') {
      // Restaurer le retrait
      const { data: restoredWithdrawal, error: restoreError } = await supabase
        .from('withdrawals')
        .insert({
          client_name: originalOperation.client_name,
          client_id: originalOperation.client_id || null,
          amount: Number(originalOperation.amount),
          operation_date: originalOperation.operation_date,
          notes: originalOperation.notes,
          status: originalOperation.status || 'completed',
          created_by: userId
        })
        .select()
        .single();
      
      if (restoreError) {
        console.error("Erreur lors de la restauration du retrait:", restoreError);
        return false;
      } else {
        console.log("Retrait restauré avec succès:", restoredWithdrawal);
        
        // Supprimer l'entrée de deleted_withdrawals
        const { error: deleteLogError } = await supabase
          .from('deleted_withdrawals')
          .delete()
          .eq('id', originalOperation.id);
        
        if (deleteLogError) {
          console.warn("Erreur lors de la suppression de l'entrée deleted_withdrawals:", deleteLogError);
        }
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erreur lors de la restauration:", error);
    return false;
  }
};

/**
 * Tente de restaurer une opération originale même si le transfert est déjà supprimé
 */
const attemptOriginalOperationRestoration = async (clientName: string, amount: number, userId: string | undefined): Promise<boolean> => {
  const originalOperation = await findOriginalOperation(clientName, amount);
  if (originalOperation) {
    return await restoreOriginalOperation(originalOperation, userId);
  }
  return false;
};
