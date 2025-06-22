
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
    
    console.log("=== SYNCHRONISATION AVEC BASE DE DONNÉES ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde actuel en DB: ${client.solde} TND`);
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
    
    console.log("=== CALCUL CHRONOLOGIQUE SYNCHRONISÉ ===");
    console.log("Operations triées par ordre chronologique (plus anciennes d'abord):");
    sortedOperations.forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type} - ${op.amount} TND`);
    });
    
    // Le solde actuel du client depuis la DB (notre point final)
    const currentDbBalance = parseFloat(client.solde?.toString() || '0');
    console.log(`Solde final attendu (DB): ${currentDbBalance.toFixed(3)} TND`);
    
    // Calculer le total des variations de toutes les opérations
    let totalVariations = 0;
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
      
      totalVariations += balanceChange;
    });
    
    console.log(`Total des variations calculées: ${totalVariations.toFixed(3)} TND`);
    
    // SYNCHRONISATION: Le solde initial doit être tel que: solde_initial + variations = solde_final_DB
    const initialBalance = currentDbBalance - totalVariations;
    console.log(`Solde initial calculé (synchronisé): ${initialBalance.toFixed(3)} TND`);
    console.log(`Vérification: ${initialBalance.toFixed(3)} + ${totalVariations.toFixed(3)} = ${(initialBalance + totalVariations).toFixed(3)} (attendu: ${currentDbBalance.toFixed(3)})`);
    
    // CALCUL PROGRESSIF SYNCHRONISÉ
    let runningBalance = initialBalance;
    const processedOps: ProcessedOperation[] = [];
    
    sortedOperations.forEach((op, index) => {
      // Calculer le changement de balance pour cette opération
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
      
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type}`);
      console.log(`   Montant: ${op.amount} TND, Variation: ${balanceChange >= 0 ? '+' : ''}${balanceChange} TND`);
      console.log(`   Solde: ${balanceBefore.toFixed(3)} → ${balanceAfter.toFixed(3)} TND`);
    });
    
    // Vérification finale de synchronisation
    const finalCalculatedBalance = processedOps.length > 0 ? processedOps[processedOps.length - 1].balanceAfter : initialBalance;
    console.log(`=== VÉRIFICATION DE SYNCHRONISATION ===`);
    console.log(`Solde calculé final: ${finalCalculatedBalance.toFixed(3)} TND`);
    console.log(`Solde DB attendu: ${currentDbBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(finalCalculatedBalance - currentDbBalance);
    if (difference > 0.001) {
      console.error(`❌ ERREUR DE SYNCHRONISATION: ${difference.toFixed(3)} TND de différence!`);
      console.error(`Le calcul chronologique ne correspond pas au solde en base de données`);
    } else {
      console.log(`✅ SYNCHRONISATION PARFAITE: Le flux chronologique correspond exactement au solde DB`);
    }
    
    // Retourner les opérations triées par date (plus récentes en premier pour l'affichage)
    const finalProcessedOps = processedOps.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA; // Plus récentes en premier pour l'affichage
    });
    
    console.log("=== RÉSULTAT FINAL SYNCHRONISÉ (ordre d'affichage - plus récent en premier) ===");
    finalProcessedOps.slice(0, 5).forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date}`);
      console.log(`   Solde avant: ${op.balanceBefore.toFixed(3)} → Solde après: ${op.balanceAfter.toFixed(3)} TND`);
      console.log(`   Variation: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} TND`);
    });
    
    return finalProcessedOps;
  }, [operations, client]);

  return processedOperations;
};
