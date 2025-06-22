
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
    
    console.log("=== CALCUL FLUX DE COMPTE - SYNCHRONISATION DB ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde actuel en DB: ${client.solde} TND`);
    console.log(`Total opérations reçues: ${operations.length}`);
    
    // Filtrer les opérations pour ce client uniquement
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      return matchesClientId || matchesFromClientId || matchesToClientId || 
             matchesFromClientName || matchesToClientName;
    });
    
    console.log(`Opérations filtrées pour le client: ${clientOperations.length}`);
    
    if (clientOperations.length === 0) {
      console.log("Aucune opération trouvée pour ce client");
      return [];
    }
    
    // Trier par ordre chronologique (plus anciennes en premier)
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateA - dateB;
    });
    
    console.log("=== OPÉRATIONS TRIÉES PAR ORDRE CHRONOLOGIQUE ===");
    sortedOperations.forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type} - ${op.amount} TND`);
    });
    
    // Calculer la variation totale de toutes les opérations
    let totalVariation = 0;
    const operationDetails: Array<{operation: Operation, variation: number}> = [];
    
    sortedOperations.forEach(op => {
      let variation = 0;
      
      if (op.type === 'deposit') {
        variation = op.amount; // Les dépôts augmentent le solde
      } else if (op.type === 'withdrawal') {
        variation = -op.amount; // Les retraits diminuent le solde
      } else if (op.type === 'transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          variation = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          variation = op.amount; // Crédit pour le destinataire
        }
      } else if (op.type === 'direct_transfer') {
        if (op.fromClient === clientFullName || op.from_client_id === clientId) {
          variation = -op.amount; // Débit pour l'expéditeur
        } else if (op.toClient === clientFullName || op.to_client_id === clientId) {
          variation = op.amount; // Crédit pour le destinataire
        }
      }
      
      operationDetails.push({ operation: op, variation });
      totalVariation += variation;
    });
    
    // Le solde actuel dans la DB
    const currentDbBalance = parseFloat(client.solde?.toString() || '0');
    console.log(`Solde actuel DB: ${currentDbBalance.toFixed(3)} TND`);
    console.log(`Variation totale calculée: ${totalVariation.toFixed(3)} TND`);
    
    // CALCUL DU SOLDE INITIAL : solde_final - variations_totales = solde_initial
    const initialBalance = currentDbBalance - totalVariation;
    console.log(`Solde initial calculé: ${initialBalance.toFixed(3)} TND`);
    console.log(`Vérification: ${initialBalance.toFixed(3)} + ${totalVariation.toFixed(3)} = ${(initialBalance + totalVariation).toFixed(3)} TND (attendu: ${currentDbBalance.toFixed(3)})`);
    
    // Construire le flux chronologique avec les soldes avant/après
    let runningBalance = initialBalance;
    const processedOps: ProcessedOperation[] = [];
    
    console.log("=== CONSTRUCTION DU FLUX CHRONOLOGIQUE ===");
    console.log(`Solde de départ: ${runningBalance.toFixed(3)} TND`);
    
    operationDetails.forEach(({ operation, variation }, index) => {
      const balanceBefore = runningBalance;
      const balanceAfter = runningBalance + variation;
      runningBalance = balanceAfter;
      
      const processedOp: ProcessedOperation = {
        ...operation,
        balanceBefore,
        balanceAfter,
        balanceChange: variation
      };
      
      processedOps.push(processedOp);
      
      console.log(`${index + 1}. ${operation.operation_date || operation.date}`);
      console.log(`   Type: ${operation.type}, Montant: ${operation.amount} TND`);
      console.log(`   Variation: ${variation >= 0 ? '+' : ''}${variation.toFixed(3)} TND`);
      console.log(`   Solde: ${balanceBefore.toFixed(3)} → ${balanceAfter.toFixed(3)} TND`);
    });
    
    // Vérification finale
    const finalCalculatedBalance = processedOps.length > 0 ? processedOps[processedOps.length - 1].balanceAfter : initialBalance;
    console.log(`=== VÉRIFICATION FINALE ===`);
    console.log(`Solde final calculé: ${finalCalculatedBalance.toFixed(3)} TND`);
    console.log(`Solde DB attendu: ${currentDbBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(finalCalculatedBalance - currentDbBalance);
    if (difference > 0.001) {
      console.error(`❌ ERREUR: Différence de ${difference.toFixed(3)} TND!`);
    } else {
      console.log(`✅ SYNCHRONISATION PARFAITE`);
    }
    
    // Retourner les opérations triées par date décroissante pour l'affichage (plus récentes en premier)
    const finalProcessedOps = processedOps.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA;
    });
    
    console.log("=== RÉSULTAT FINAL (ordre d'affichage - plus récent en premier) ===");
    finalProcessedOps.slice(0, 3).forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date}`);
      console.log(`   Solde avant: ${op.balanceBefore.toFixed(3)} → Solde après: ${op.balanceAfter.toFixed(3)} TND`);
      console.log(`   Variation: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange.toFixed(3)} TND`);
    });
    
    return finalProcessedOps;
  }, [operations, client]);

  return processedOperations;
};
