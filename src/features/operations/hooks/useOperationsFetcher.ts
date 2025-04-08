
import { useCallback } from 'react';
import { Operation } from '../types';
import { mockOperations } from '../data/mock-operations';

/**
 * Hook ultra-simplifié qui fournit des données de manière synchrone
 * pour une performance maximale
 */
export const useOperationsFetcher = () => {
  // Fonction synchrone qui retourne immédiatement les données
  const getMockOperations = useCallback((): Operation[] => {
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
    // Fonctions synchrones pour une meilleure performance
    getOperations: getMockOperations,
    getDeposits: () => getMockOperations().filter(op => op.type === 'deposit'),
    getWithdrawals: () => getMockOperations().filter(op => op.type === 'withdrawal'),
    getTransfers: () => getMockOperations().filter(op => op.type === 'transfer')
  };
};
