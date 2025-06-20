
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
    
    console.log("=== DIAGNOSTIC FLUX DE COMPTE - CLIENT PROMO BET ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde en base: ${Number(client.solde).toFixed(3)} TND`);
    console.log(`Total opérations disponibles: ${operations.length}`);
    
    // Filtrage des opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      const isMatching = matchesClientId || matchesFromClientId || matchesToClientId || 
                        matchesFromClientName || matchesToClientName;
      
      if (isMatching) {
        console.log(`✓ Opération retenue: ${op.id} | Type: ${op.type} | Montant: ${op.amount} | Date: ${op.operation_date || op.date}`);
        console.log(`  - client_id: ${op.client_id}, from_client_id: ${op.from_client_id}, to_client_id: ${op.to_client_id}`);
        console.log(`  - fromClient: "${op.fromClient}", toClient: "${op.toClient}"`);
      }
      
      return isMatching;
    });
    
    console.log(`=== OPÉRATIONS FILTRÉES POUR ${clientFullName}: ${clientOperations.length} ===`);
    
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

    console.log("=== ORDRE CHRONOLOGIQUE POUR CALCUL ===");
    sortedOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss");
      console.log(`${i + 1}. [${date}] ${op.type} | ${op.amount} TND | ID: ${op.id}`);
    });

    // CALCUL CORRIGÉ DES SOLDES
    console.log("\n=== CALCUL CORRIGÉ DES SOLDES ===");
    console.log("🎯 Objectif: Calculer les soldes 'avant' et 'après' pour chaque opération");
    
    let runningBalance = 0; // Démarrage à 0 pour tous les clients
    
    const operationsWithBalance = sortedOperations.map((op, index) => {
      const balanceBefore = runningBalance;
      let impact = 0;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`ID: ${op.id} | Type: ${op.type} | Montant: ${op.amount} TND`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss")}`);
      console.log(`Solde AVANT cette opération: ${balanceBefore.toFixed(3)} TND`);
      
      // CALCUL DE L'IMPACT - logique corrigée
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          console.log(`📥 DÉPÔT: +${impact} TND (ajout au solde)`);
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          console.log(`📤 RETRAIT: ${impact} TND (soustraction du solde)`);
          break;
          
        case "transfer":
          // Vérifier si ce client envoie ou reçoit
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 VIREMENT REÇU: +${impact} TND (de: ${op.fromClient || 'N/A'})`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 VIREMENT ENVOYÉ: ${impact} TND (vers: ${op.toClient || 'N/A'})`);
          } else {
            console.log(`⚠️ TRANSFERT: Ni expéditeur ni destinataire détecté pour ce client`);
          }
          break;
          
        case "direct_transfer":
          // Vérifier si ce client envoie ou reçoit
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 TRANSFERT DIRECT REÇU: +${impact} TND (de: ${op.fromClient || 'N/A'})`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 TRANSFERT DIRECT ENVOYÉ: ${impact} TND (vers: ${op.toClient || 'N/A'})`);
          } else {
            console.log(`⚠️ TRANSFERT DIRECT: Ni expéditeur ni destinataire détecté pour ce client`);
          }
          break;
          
        default:
          console.log(`⚠️ Type d'opération non reconnu: ${op.type}`);
      }
      
      // Application de l'impact
      runningBalance = balanceBefore + impact;
      
      console.log(`Impact appliqué: ${impact >= 0 ? '+' : ''}${impact} TND`);
      console.log(`Solde APRÈS cette opération: ${runningBalance.toFixed(3)} TND`);
      
      return {
        ...op,
        balanceBefore: Number(balanceBefore.toFixed(3)),
        balanceAfter: Number(runningBalance.toFixed(3)),
        balanceChange: Number(impact.toFixed(3))
      };
    });

    console.log("\n=== VÉRIFICATION FINALE ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde calculé chronologiquement: ${runningBalance.toFixed(3)} TND`);
    console.log(`Solde en base de données: ${Number(client.solde).toFixed(3)} TND`);
    
    const difference = Math.abs(runningBalance - Number(client.solde));
    console.log(`Écart absolu: ${difference.toFixed(3)} TND`);
    
    if (difference > 0.01) {
      console.error("❌ INCOHÉRENCE DÉTECTÉE POUR PROMO BET!");
      console.error(`Le calcul chronologique (${runningBalance.toFixed(3)} TND) ne correspond pas au solde en base (${Number(client.solde).toFixed(3)} TND)`);
      console.error("Possible causes :");
      console.error("- Opérations manquantes");
      console.error("- Erreur dans le calcul d'impact");
      console.error("- Données incohérentes en base");
      
      // Diagnostic détaillé pour promo bet
      console.log("\n=== DIAGNOSTIC DÉTAILLÉ PROMO BET ===");
      operationsWithBalance.forEach((op, i) => {
        console.log(`${i + 1}. ${op.type} | Avant: ${op.balanceBefore} | Impact: ${op.balanceChange >= 0 ? '+' : ''}${op.balanceChange} | Après: ${op.balanceAfter}`);
      });
    } else {
      console.log("✅ COHÉRENCE CONFIRMÉE pour promo bet");
    }

    // Retourner en ordre inverse pour affichage (plus récent en premier)
    return [...operationsWithBalance].reverse();
  }, [operations, client]);

  return processedOperations;
};
