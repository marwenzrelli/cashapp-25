
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types';
import { mockOperations } from '../data/mock-operations';  // Corrigé le chemin et le nom

export const useOperationsFetcher = () => {
  // Fonction pour récupérer toutes les opérations
  const getOperations = useCallback(async (cacheBuster = '') => {
    const operations: Operation[] = [];
    
    console.log("Récupération des opérations avec cacheBuster:", cacheBuster);
    
    // Ajout d'un paramètre aléatoire pour éviter tout problème de cache
    const timestamp = Date.now();
    
    // Utiliser Promise.all pour paralléliser les requêtes avec limite pour optimiser le chargement
    const [depositsResult, withdrawalsResult, transfersResult] = await Promise.all([
      supabase.from('deposits').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('transfers').select('*').order('created_at', { ascending: false }).limit(200)
    ]);
    
    // Vérifier les erreurs pour chaque requête
    if (depositsResult.error) {
      console.error('Error fetching deposits:', depositsResult.error);
      throw new Error(`Erreur lors du chargement des dépôts: ${depositsResult.error.message}`);
    }
    
    if (withdrawalsResult.error) {
      console.error('Error fetching withdrawals:', withdrawalsResult.error);
      throw new Error(`Erreur lors du chargement des retraits: ${withdrawalsResult.error.message}`);
    }
    
    if (transfersResult.error) {
      console.error('Error fetching transfers:', transfersResult.error);
      throw new Error(`Erreur lors du chargement des transferts: ${transfersResult.error.message}`);
    }
    
    // Debuggons les résultats
    console.log(`Données récupérées - Dépôts: ${depositsResult.data?.length}, Retraits: ${withdrawalsResult.data?.length}, Transferts: ${transfersResult.data?.length}`);
    
    // Traiter les dépôts
    if (depositsResult.data) {
      const deposits = depositsResult.data.map(deposit => ({
        id: `dep-${deposit.id}`,
        type: 'deposit' as const,
        date: deposit.operation_date ? new Date(deposit.operation_date).toISOString() : new Date(deposit.created_at).toISOString(),
        operation_date: deposit.operation_date,
        fromClient: deposit.client_name,
        amount: Number(deposit.amount),
        description: deposit.notes || '',
        status: deposit.status || 'completed',
        createdAt: deposit.created_at
      }));
      operations.push(...deposits);
    }
    
    // Traiter les retraits
    if (withdrawalsResult.data) {
      const withdrawals = withdrawalsResult.data.map(withdrawal => ({
        id: `wit-${withdrawal.id}`,
        type: 'withdrawal' as const,
        date: withdrawal.operation_date ? new Date(withdrawal.operation_date).toISOString() : new Date(withdrawal.created_at).toISOString(),
        operation_date: withdrawal.operation_date,
        fromClient: withdrawal.client_name,
        amount: Number(withdrawal.amount),
        description: withdrawal.notes || '',
        status: withdrawal.status || 'completed',
        createdAt: withdrawal.created_at
      }));
      operations.push(...withdrawals);
    }
    
    // Traiter les transferts
    if (transfersResult.data) {
      const transfers = transfersResult.data.map(transfer => ({
        id: `tra-${transfer.id}`,
        type: 'transfer' as const,
        date: transfer.operation_date ? new Date(transfer.operation_date).toISOString() : new Date(transfer.created_at).toISOString(),
        operation_date: transfer.operation_date,
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        amount: Number(transfer.amount),
        description: transfer.reason || '',
        status: transfer.status || 'completed',
        createdAt: transfer.created_at
      }));
      operations.push(...transfers);
    }
    
    console.log(`Loaded ${operations.length} operations`);
    
    // Trier toutes les opérations par date (du plus récent au plus ancien)
    return operations.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);
  
  // Fonction pour obtenir des données mock en cas d'erreur
  const getMockOperations = useCallback(() => {
    return mockOperations;
  }, []);
  
  return { getOperations, getMockOperations };
};
