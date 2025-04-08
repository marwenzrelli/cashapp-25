
import { useCallback } from 'react';
import { Operation } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { mockOperations } from '../data/mock-operations';

/**
 * Hook qui récupère les données d'opérations depuis Supabase
 * avec une solution de secours vers les données mock
 */
export const useOperationsFetcher = () => {
  // Fonction qui récupère les vraies données de Supabase
  const getRealOperations = useCallback(async (): Promise<Operation[]> => {
    try {
      console.log('Fetching real operations from Supabase...');
      
      // Récupérer les dépôts - ne pas limiter le nombre de résultats
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('operation_date', { ascending: false });
      
      if (depositsError) throw depositsError;
      
      // Récupérer les retraits - ne pas limiter le nombre de résultats
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('operation_date', { ascending: false });
      
      if (withdrawalsError) throw withdrawalsError;
      
      // Récupérer les transferts - ne pas limiter le nombre de résultats
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('operation_date', { ascending: false });
      
      if (transfersError) throw transfersError;
      
      console.log(`Fetched: ${deposits?.length || 0} deposits, ${withdrawals?.length || 0} withdrawals, ${transfers?.length || 0} transfers`);
      
      // Transformer les données en format Operation
      const operations: Operation[] = [
        ...(deposits || []).map(dep => ({
          id: `dep-${dep.id}`,
          type: 'deposit' as const,
          amount: Number(dep.amount),
          date: dep.created_at,
          operation_date: dep.operation_date,
          description: dep.notes || 'Versement',
          fromClient: dep.client_name,
          client_id: dep.client_id,
          formattedDate: new Date(dep.operation_date || dep.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })),
        ...(withdrawals || []).map(wit => ({
          id: `wit-${wit.id}`,
          type: 'withdrawal' as const,
          amount: Number(wit.amount),
          date: wit.created_at,
          operation_date: wit.operation_date,
          description: wit.notes || 'Retrait',
          fromClient: wit.client_name,
          client_id: wit.client_id,
          formattedDate: new Date(wit.operation_date || wit.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })),
        ...(transfers || []).map(tra => ({
          id: `tra-${tra.id}`,
          type: 'transfer' as const,
          amount: Number(tra.amount),
          date: tra.created_at,
          operation_date: tra.operation_date,
          description: tra.reason || 'Virement',
          fromClient: tra.from_client,
          toClient: tra.to_client,
          formattedDate: new Date(tra.operation_date || tra.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
      ];
      
      // Trier les opérations par date (les plus récentes d'abord)
      return operations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching real operations:', error);
      throw error;
    }
  }, []);

  // Fallback aux données mock si la requête échoue
  const getMockOperations = useCallback((): Operation[] => {
    console.log('Using mock operations as fallback');
    return mockOperations.map(op => ({
      ...op,
      formattedDate: new Date(op.operation_date || op.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }, []);

  return {
    // Fonction principale qui tente d'abord de récupérer les vraies données
    getOperations: getRealOperations,
    getMockOperations
  };
};
