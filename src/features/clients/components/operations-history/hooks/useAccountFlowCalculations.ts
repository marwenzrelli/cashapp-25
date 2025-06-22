
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
    if (!operations || operations.length === 0) {
      console.log("AccountFlowCalculations - No operations available");
      return [];
    }
    
    if (!client) {
      console.log("AccountFlowCalculations - No client available");
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    const clientId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
    
    console.log("=== CALCUL FLUX CHRONOLOGIQUE CORRIGÉ ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Total operations to process: ${operations.length}`);
    
    // Filtrer les opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      const matches = matchesClientId || matchesFromClientId || matchesToClientId || 
                     matchesFromClientName || matchesToClientName;
      
      return matches;
    });
    
    console.log(`Filtered client operations: ${clientOperations.length}`);
    
    if (clientOperations.length === 0) {
      console.log("No operations found for this client after filtering");
      return [];
    }
    
    // Trier les opérations par date chronologique (plus anciennes en premier)
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateA - dateB;
    });
    
    console.log("Operations triées par ordre chronologique:");
    sortedOperations.forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type} - ${op.amount} TND`);
    });
    
    // Le solde actuel du client (fin de toutes les opérations)
    const currentBalance = client.solde || 0;
    console.log(`Solde actuel du client: ${currentBalance} TND`);
    
    // Nouvelle approche: calculer les soldes en partant de la fin vers le début
    // Puis reconstituer dans l'ordre chronologique
    const processedOps: ProcessedOperation[] = [];
    
    // D'abord, calculer tous les changements de balance
    const operationsWithChanges = sortedOperations.map(op => {
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
      
      return { ...op, balanceChange };
    });
    
    // Calculer le solde initial en partant du solde actuel et en remontant
    let totalChanges = 0;
    operationsWithChanges.forEach(op => {
      totalChanges += op.balanceChange;
    });
    
    const initialBalance = currentBalance - totalChanges;
    console.log(`Solde initial calculé: ${initialBalance} TND`);
    console.log(`Total des changements: ${totalChanges} TND`);
    
    // Maintenant calculer les soldes progressifs dans l'ordre chronologique
    let runningBalance = initialBalance;
    
    operationsWithChanges.forEach((op, index) => {
      const balanceBefore = runningBalance;
      const balanceAfter = runningBalance + op.balanceChange;
      runningBalance = balanceAfter;
      
      const processedOp: ProcessedOperation = {
        ...op,
        balanceBefore,
        balanceAfter,
        balanceChange: op.balanceChange
      };
      
      processedOps.push(processedOp);
      
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type}`);
      console.log(`   Montant: ${op.amount} TND, Change: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} TND`);
      console.log(`   Solde: ${balanceBefore} → ${balanceAfter} TND`);
    });
    
    // Vérification finale
    const finalCalculatedBalance = processedOps.length > 0 ? processedOps[processedOps.length - 1].balanceAfter : initialBalance;
    console.log(`Vérification: Solde final calculé = ${finalCalculatedBalance}, Solde client = ${currentBalance}`);
    
    if (Math.abs(finalCalculatedBalance - currentBalance) > 0.01) {
      console.warn(`ATTENTION: Différence détectée entre solde calculé (${finalCalculatedBalance}) et solde client (${currentBalance})`);
    }
    
    // Retourner les opérations triées par date (plus récentes en premier pour l'affichage)
    const finalProcessedOps = processedOps.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA; // Plus récentes en premier pour l'affichage
    });
    
    console.log("=== RÉSULTAT FINAL (ordre d'affichage - plus récent en premier) ===");
    finalProcessedOps.forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date}`);
      console.log(`   Solde avant: ${op.balanceBefore} → Solde après: ${op.balanceAfter} TND`);
    });
    
    return finalProcessedOps;
  }, [operations, client]);

  return processedOperations;
};
