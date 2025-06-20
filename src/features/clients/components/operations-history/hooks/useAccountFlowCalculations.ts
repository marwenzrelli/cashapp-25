
import { useMemo } from "react";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";

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
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    const clientId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
    
    console.log("=== CALCUL CORRIGÉ DES SOLDES - VERSION FIXÉE ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde actuel en base: ${Number(client.solde).toFixed(3)} TND`);
    console.log(`Total opérations disponibles: ${operations.length}`);
    
    // Filtrage des opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      return matchesClientId || matchesFromClientId || matchesToClientId || 
             matchesFromClientName || matchesToClientName;
    });
    
    console.log(`=== OPÉRATIONS FILTRÉES: ${clientOperations.length} ===`);
    
    if (clientOperations.length === 0) {
      console.log("⚠️ Aucune opération trouvée");
      return [];
    }

    // Tri chronologique: plus ancien en premier
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      
      if (dateA === dateB) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA - dateB;
    });

    console.log("=== ORDRE CHRONOLOGIQUE ===");
    sortedOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss");
      console.log(`${i + 1}. [${date}] ${op.type} | ${op.amount} TND | ID: ${op.id}`);
    });

    // CALCUL CORRIGÉ: partir du solde actuel et calculer vers le passé
    const currentBalance = Number(client.solde);
    console.log(`\n=== CALCUL SÉQUENTIEL CORRIGÉ ===`);
    console.log(`Solde actuel: ${currentBalance.toFixed(3)} TND`);
    
    // Calculer l'impact cumulé de toutes les opérations
    let totalImpact = 0;
    const operationImpacts = sortedOperations.map(op => {
      let impact = 0;
      
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          break;
          
        case "transfer":
        case "direct_transfer":
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount); // Réception
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount); // Envoi
          }
          break;
      }
      
      totalImpact += impact;
      return { operation: op, impact };
    });
    
    // Le solde initial = solde actuel - impact total
    const initialBalance = currentBalance - totalImpact;
    console.log(`Impact total calculé: ${totalImpact.toFixed(3)} TND`);
    console.log(`Solde initial reconstitué: ${initialBalance.toFixed(3)} TND`);
    
    // Maintenant calculer les soldes séquentiels
    let runningBalance = initialBalance;
    
    const operationsWithBalance = operationImpacts.map(({ operation: op, impact }, index) => {
      const balanceBefore = runningBalance;
      const balanceAfter = balanceBefore + impact;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`Type: ${op.type} | Montant: ${op.amount} TND`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm")}`);
      console.log(`Solde AVANT: ${balanceBefore.toFixed(3)} TND`);
      console.log(`Impact: ${impact >= 0 ? '+' : ''}${impact.toFixed(3)} TND`);
      console.log(`Solde APRÈS: ${balanceAfter.toFixed(3)} TND`);
      
      // Mettre à jour le solde courant
      runningBalance = balanceAfter;
      
      return {
        ...op,
        balanceBefore: Number(balanceBefore.toFixed(3)),
        balanceAfter: Number(balanceAfter.toFixed(3)),
        balanceChange: Number(impact.toFixed(3))
      };
    });

    console.log("\n=== VÉRIFICATION FINALE ===");
    console.log(`Solde final calculé: ${runningBalance.toFixed(3)} TND`);
    console.log(`Solde en base: ${currentBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(runningBalance - currentBalance);
    if (difference > 0.001) {
      console.error(`❌ ÉCART DÉTECTÉ: ${difference.toFixed(3)} TND`);
    } else {
      console.log("✅ CALCULS COHÉRENTS");
    }

    // Retourner en ordre inverse pour affichage (plus récent en premier)
    return [...operationsWithBalance].reverse();
  }, [operations, client]);

  return processedOperations;
};
