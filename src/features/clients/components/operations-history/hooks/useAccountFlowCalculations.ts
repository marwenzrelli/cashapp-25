
import { useMemo } from "react";
import { Operation } from "@/features/operations/types";

interface ProcessedOperation extends Operation {
  balanceBefore: number;
  balanceAfter: number;
  balanceChange: number;
}

interface UseAccountFlowCalculationsProps {
  operations: Operation[];
  client?: any;
}

export const useAccountFlowCalculations = ({ operations, client }: UseAccountFlowCalculationsProps) => {
  const processedOperations = useMemo(() => {
    if (!client || !operations || operations.length === 0) {
      console.log("AccountFlowCalculations - No client or operations available");
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    const clientId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
    
    console.log("=== CALCUL FLUX UNIFORME POUR TOUS CLIENTS ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Total operations to process: ${operations.length}`);
    
    // Filtrer les opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      return matchesClientId || matchesFromClientId || matchesToClientId || 
             matchesFromClientName || matchesToClientName;
    });
    
    console.log(`Filtered client operations: ${clientOperations.length}`);
    
    if (clientOperations.length === 0) {
      console.log("No operations found for this client");
      return [];
    }
    
    // Trier les opérations par date (plus anciennes en premier pour calcul chronologique)
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateA - dateB;
    });
    
    // Calculer les soldes progressifs
    let currentBalance = client.solde || 0;
    const processedOps: ProcessedOperation[] = [];
    
    // Calculer le solde initial (avant toutes les opérations)
    let totalChange = 0;
    sortedOperations.forEach(op => {
      let balanceChange = 0;
      
      if (op.type === 'deposit') {
        balanceChange = op.amount;
      } else if (op.type === 'withdrawal') {
        balanceChange = -op.amount;
      } else if (op.type === 'transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = op.amount; // Crédit pour le destinataire
        }
      } else if (op.type === 'direct_transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = op.amount; // Crédit pour le destinataire
        }
      }
      
      totalChange += balanceChange;
    });
    
    // Le solde initial est le solde actuel moins tous les changements
    let initialBalance = currentBalance - totalChange;
    let runningBalance = initialBalance;
    
    console.log(`Initial balance calculated: ${initialBalance}`);
    console.log(`Current balance: ${currentBalance}`);
    console.log(`Total change from operations: ${totalChange}`);
    
    // Traiter chaque opération chronologiquement
    sortedOperations.forEach((op, index) => {
      let balanceChange = 0;
      
      if (op.type === 'deposit') {
        balanceChange = op.amount;
      } else if (op.type === 'withdrawal') {
        balanceChange = -op.amount;
      } else if (op.type === 'transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = op.amount; // Crédit pour le destinataire
        }
      } else if (op.type === 'direct_transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          balanceChange = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          balanceChange = op.amount; // Crédit pour le destinataire
        }
      }
      
      const balanceBefore = runningBalance;
      const balanceAfter = runningBalance + balanceChange;
      runningBalance = balanceAfter;
      
      const processedOp: ProcessedOperation = {
        ...op,
        balanceBefore,
        balanceAfter,
        balanceChange
      };
      
      processedOps.push(processedOp);
      
      console.log(`Operation ${index + 1}: ${op.type} - ${op.amount} - Balance: ${balanceBefore} -> ${balanceAfter}`);
    });
    
    // Retourner les opérations triées par date (plus récentes en premier pour l'affichage)
    const finalProcessedOps = processedOps.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA;
    });
    
    console.log(`Final processed operations: ${finalProcessedOps.length}`);
    return finalProcessedOps;
  }, [operations, client]);

  return processedOperations;
};
