
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
    
    console.log("=== NOUVEAU CALCUL FLUX DE COMPTE ===");
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

    // NOUVELLE LOGIQUE: Commencer à 0 et calculer séquentiellement
    console.log(`\n=== CALCUL SÉQUENTIEL DEPUIS 0 ===`);
    console.log(`Solde de départ: 0.000 TND`);
    
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
          // Logique améliorée pour les transferts
          const isReceiver = (op.toClient === clientFullName) || (op.to_client_id === clientId);
          const isSender = (op.fromClient === clientFullName) || (op.from_client_id === clientId);
          
          console.log(`Analyse transfert ${op.id}:`);
          console.log(`  - toClient: "${op.toClient}" vs "${clientFullName}" => ${op.toClient === clientFullName}`);
          console.log(`  - to_client_id: ${op.to_client_id} vs ${clientId} => ${op.to_client_id === clientId}`);
          console.log(`  - fromClient: "${op.fromClient}" vs "${clientFullName}" => ${op.fromClient === clientFullName}`);
          console.log(`  - from_client_id: ${op.from_client_id} vs ${clientId} => ${op.from_client_id === clientId}`);
          console.log(`  - isReceiver: ${isReceiver}, isSender: ${isSender}`);
          
          if (isReceiver && !isSender) {
            // C'est une réception = entrée positive
            impact = Number(op.amount);
            description = "Virement reçu (+)";
            console.log(`  => RÉCEPTION: +${impact} TND`);
          } else if (isSender && !isReceiver) {
            // C'est un envoi = sortie négative
            impact = -Number(op.amount);
            description = "Virement envoyé (-)";
            console.log(`  => ENVOI: ${impact} TND`);
          } else {
            // Cas ambigu - ne pas compter
            impact = 0;
            description = "Transfert ambigu (0)";
            console.log(`  => AMBIGU: 0 TND`);
          }
          break;
          
        default:
          impact = 0;
          description = "Type inconnu (0)";
      }
      
      console.log(`Impact final pour ${op.id}: ${impact.toFixed(3)} TND (${description})`);
      return { operation: op, impact, description };
    });

    // Calculer les soldes séquentiels en partant de 0
    let runningBalance = 0; // Toujours commencer à 0
    
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
    console.log(`Solde en base: ${Number(client.solde).toFixed(3)} TND`);
    
    const difference = Math.abs(runningBalance - Number(client.solde));
    if (difference > 0.001) {
      console.log(`⚠️ ÉCART DÉTECTÉ: ${difference.toFixed(3)} TND`);
      console.log(`Note: Ceci peut être normal si des opérations sont manquantes ou si le solde en base a été ajusté manuellement`);
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
