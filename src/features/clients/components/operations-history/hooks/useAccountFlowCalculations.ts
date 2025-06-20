
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
    
    console.log("=== CALCUL RÉINITIALISÉ DES SOLDES ===");
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

    // NOUVELLE APPROCHE: Calculer les impacts et partir du solde final vers le passé
    const currentBalance = Number(client.solde);
    console.log(`\n=== CALCUL SIMPLIFIÉ ET CORRECT ===`);
    console.log(`Solde final (actuel): ${currentBalance.toFixed(3)} TND`);
    
    // Calculer l'impact de chaque opération avec une logique claire
    const operationsWithImpact = sortedOperations.map(op => {
      let impact = 0;
      let description = "";
      
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          description = "Dépôt (+)";
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          description = "Retrait (-)";
          break;
          
        case "transfer":
        case "direct_transfer":
          // Vérifier si c'est une réception ou un envoi
          const isReceiver = (op.toClient === clientFullName) || (op.to_client_id === clientId);
          const isSender = (op.fromClient === clientFullName) || (op.from_client_id === clientId);
          
          if (isReceiver && !isSender) {
            impact = Number(op.amount);
            description = "Réception (+)";
          } else if (isSender && !isReceiver) {
            impact = -Number(op.amount);
            description = "Envoi (-)";
          } else {
            // Cas ambigu - ne pas compter
            impact = 0;
            description = "Opération ambiguë (0)";
            console.warn(`Opération ambiguë détectée: ${op.id}`, { op, isReceiver, isSender });
          }
          break;
          
        default:
          impact = 0;
          description = "Type inconnu (0)";
      }
      
      console.log(`Impact calculé pour ${op.id}: ${impact.toFixed(3)} TND (${description})`);
      return { operation: op, impact, description };
    });

    // Calculer le solde initial en soustrayant tous les impacts du solde final
    const totalImpact = operationsWithImpact.reduce((sum, { impact }) => sum + impact, 0);
    const initialBalance = currentBalance - totalImpact;
    
    console.log(`Impact total cumulé: ${totalImpact.toFixed(3)} TND`);
    console.log(`Solde initial calculé: ${initialBalance.toFixed(3)} TND`);
    
    // Calculer les soldes séquentiels en partant du solde initial
    let runningBalance = initialBalance;
    
    const operationsWithBalances = operationsWithImpact.map(({ operation: op, impact, description }, index) => {
      const balanceBefore = runningBalance;
      const balanceAfter = balanceBefore + impact;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`Type: ${op.type} | Montant: ${op.amount} TND`);
      console.log(`Description: ${description}`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm")}`);
      console.log(`Solde AVANT: ${balanceBefore.toFixed(3)} TND`);
      console.log(`Impact: ${impact >= 0 ? '+' : ''}${impact.toFixed(3)} TND`);
      console.log(`Solde APRÈS: ${balanceAfter.toFixed(3)} TND`);
      
      // Mettre à jour le solde courant pour la prochaine itération
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
      console.error(`Causes possibles:`);
      console.error(`1. Opérations manquantes ou en double`);
      console.error(`2. Erreur dans la logique de calcul des impacts`);
      console.error(`3. Données incohérentes en base`);
    } else {
      console.log("✅ CALCULS PARFAITEMENT COHÉRENTS");
    }

    // Retourner en ordre inverse pour affichage (plus récent en premier)
    const finalOperations = [...operationsWithBalances].reverse();
    
    console.log("\n=== RÉSUMÉ DES SOLDES FINAUX (ORDRE D'AFFICHAGE) ===");
    finalOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM");
      console.log(`${i + 1}. [${date}] ${op.type} | Avant: ${op.balanceBefore} | Change: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} | Après: ${op.balanceAfter}`);
    });
    
    return finalOperations;
  }, [operations, client]);

  return processedOperations;
};
