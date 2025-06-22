
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
    
    console.log("=== FLUX DE COMPTE COMPLET ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Total opérations reçues: ${operations.length}`);
    
    // Filtrer TOUTES les opérations qui concernent ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClient = op.fromClient === clientFullName;
      const matchesToClient = op.toClient === clientFullName;
      
      // Inclure tous les types d'opérations qui affectent le solde
      const isRelevantOperation = 
        op.type === 'deposit' || 
        op.type === 'withdrawal' || 
        op.type === 'transfer' || 
        op.type === 'direct_transfer';
      
      return (matchesClientId || matchesFromClient || matchesToClient) && isRelevantOperation;
    });
    
    console.log(`Opérations filtrées pour ce client: ${clientOperations.length}`);
    console.log(`Types d'opérations trouvées:`, {
      deposits: clientOperations.filter(op => op.type === 'deposit').length,
      withdrawals: clientOperations.filter(op => op.type === 'withdrawal').length,
      transfers: clientOperations.filter(op => op.type === 'transfer').length,
      direct_transfers: clientOperations.filter(op => op.type === 'direct_transfer').length
    });
    
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
    
    console.log("=== OPÉRATIONS TRIÉES PAR DATE ===");
    sortedOperations.forEach((op, index) => {
      console.log(`${index + 1}. ${op.operation_date || op.date} - ${op.type} - ${op.amount} TND - ${op.fromClient || ''} ${op.toClient ? `→ ${op.toClient}` : ''}`);
    });
    
    // Calculer le flux progressif en partant de zéro
    let runningBalance = 0;
    const processedOps: ProcessedOperation[] = [];
    
    console.log("=== CALCUL DU FLUX PROGRESSIF ===");
    console.log(`Solde de départ: 0 TND`);
    
    sortedOperations.forEach((operation, index) => {
      const balanceBefore = runningBalance;
      let balanceChange = 0;
      
      // Calculer la variation selon le type d'opération et la direction
      if (operation.type === 'deposit') {
        balanceChange = operation.amount; // Les dépôts augmentent le solde
      } else if (operation.type === 'withdrawal') {
        balanceChange = -operation.amount; // Les retraits diminuent le solde
      } else if (operation.type === 'transfer') {
        // Pour les transferts, vérifier si c'est entrant ou sortant
        if (operation.fromClient === clientFullName) {
          balanceChange = -operation.amount; // Transfert sortant
        } else if (operation.toClient === clientFullName) {
          balanceChange = operation.amount; // Transfert entrant
        }
      } else if (operation.type === 'direct_transfer') {
        // Pour les opérations directes, vérifier si c'est entrant ou sortant
        if (operation.fromClient === clientFullName) {
          balanceChange = -operation.amount; // Opération sortante
        } else if (operation.toClient === clientFullName) {
          balanceChange = operation.amount; // Opération entrante
        }
      }
      
      const balanceAfter = balanceBefore + balanceChange;
      runningBalance = balanceAfter;
      
      const processedOp: ProcessedOperation = {
        ...operation,
        balanceBefore,
        balanceAfter,
        balanceChange
      };
      
      processedOps.push(processedOp);
      
      console.log(`${index + 1}. ${operation.operation_date || operation.date}`);
      console.log(`   Type: ${operation.type}, Montant: ${operation.amount} TND`);
      console.log(`   Direction: ${operation.fromClient || ''} ${operation.toClient ? `→ ${operation.toClient}` : ''}`);
      console.log(`   Variation: ${balanceChange >= 0 ? '+' : ''}${balanceChange.toFixed(3)} TND`);
      console.log(`   Solde: ${balanceBefore.toFixed(3)} → ${balanceAfter.toFixed(3)} TND`);
    });
    
    // Vérification finale
    const finalCalculatedBalance = processedOps.length > 0 ? processedOps[processedOps.length - 1].balanceAfter : 0;
    const currentDbBalance = parseFloat(client.solde?.toString() || '0');
    
    console.log(`=== VÉRIFICATION FINALE ===`);
    console.log(`Nombre total d'opérations traitées: ${processedOps.length}`);
    console.log(`Solde final calculé: ${finalCalculatedBalance.toFixed(3)} TND`);
    console.log(`Solde DB actuel: ${currentDbBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(finalCalculatedBalance - currentDbBalance);
    if (difference > 0.001) {
      console.log(`⚠️  Différence de ${difference.toFixed(3)} TND entre le calcul et la DB`);
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
