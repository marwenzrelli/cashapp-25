
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
    
    console.log("=== CALCUL FLUX CHRONOLOGIQUE SYNCHRONISÉ ===");
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
    console.log(`Solde actuel du client dans la DB: ${currentBalance} TND`);
    
    // Calculer les changements de balance pour chaque opération
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
    
    // Calculer le solde initial en partant du solde actuel
    let totalChanges = 0;
    operationsWithChanges.forEach(op => {
      totalChanges += op.balanceChange;
    });
    
    // Le solde initial est le solde actuel moins tous les changements
    const calculatedInitialBalance = currentBalance - totalChanges;
    console.log(`Solde initial calculé: ${calculatedInitialBalance} TND`);
    console.log(`Total des changements appliqués: ${totalChanges} TND`);
    
    // Maintenant calculer les soldes progressifs dans l'ordre chronologique
    // en partant du solde initial calculé
    let runningBalance = calculatedInitialBalance;
    const processedOps: ProcessedOperation[] = [];
    
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
      console.log(`   Montant: ${op.amount} TND, Variation: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} TND`);
      console.log(`   Solde: ${balanceBefore.toFixed(3)} → ${balanceAfter.toFixed(3)} TND`);
    });
    
    // Vérification de cohérence finale
    const finalCalculatedBalance = processedOps.length > 0 ? processedOps[processedOps.length - 1].balanceAfter : calculatedInitialBalance;
    console.log(`=== VÉRIFICATION DE COHÉRENCE ===`);
    console.log(`Solde final calculé: ${finalCalculatedBalance.toFixed(3)} TND`);
    console.log(`Solde actuel en DB: ${currentBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(finalCalculatedBalance - currentBalance);
    if (difference > 0.001) {
      console.error(`⚠️ INCOHÉRENCE DÉTECTÉE: Différence de ${difference.toFixed(3)} TND`);
      console.error(`Cela peut indiquer un problème de synchronisation avec la base de données`);
    } else {
      console.log(`✅ Cohérence vérifiée: Les soldes sont synchronisés`);
    }
    
    // Retourner les opérations triées par date (plus récentes en premier pour l'affichage)
    const finalProcessedOps = processedOps.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA; // Plus récentes en premier pour l'affichage
    });
    
    console.log("=== RÉSULTAT FINAL (ordre d'affichage - plus récent en premier) ===");
    finalProcessedOps.slice(0, 5).forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date}`);
      console.log(`   Solde avant: ${op.balanceBefore.toFixed(3)} → Solde après: ${op.balanceAfter.toFixed(3)} TND`);
      console.log(`   Variation: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} TND`);
    });
    
    return finalProcessedOps;
  }, [operations, client]);

  return processedOperations;
};
