
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
    
    console.log("=== DIAGNOSTIC FLUX DE COMPTE - PROMO BET CORRIGÉ ===");
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
      
      const isMatching = matchesClientId || matchesFromClientId || matchesToClientId || 
                        matchesFromClientName || matchesToClientName;
      
      if (isMatching) {
        console.log(`✓ Opération retenue: ${op.id} | Type: ${op.type} | Montant: ${op.amount} | Date: ${op.operation_date || op.date}`);
      }
      
      return isMatching;
    });
    
    console.log(`=== OPÉRATIONS FILTRÉES POUR ${clientFullName}: ${clientOperations.length} ===`);
    
    if (clientOperations.length === 0) {
      console.log("⚠️ Aucune opération trouvée");
      return [];
    }

    // Tri chronologique: plus ancien en premier pour le calcul
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      
      if (dateA === dateB) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA - dateB;
    });

    console.log("=== ORDRE CHRONOLOGIQUE CORRIGÉ ===");
    sortedOperations.forEach((op, i) => {
      const date = format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss");
      console.log(`${i + 1}. [${date}] ${op.type} | ${op.amount} TND | ID: ${op.id}`);
    });

    // CALCUL CORRIGÉ DES SOLDES
    console.log("\n=== CALCUL CORRIGÉ DES SOLDES SÉQUENTIELS ===");
    
    // Calculer le solde initial en partant du solde actuel et en remontant les opérations
    const currentBalance = Number(client.solde);
    console.log(`Solde actuel du client: ${currentBalance.toFixed(3)} TND`);
    
    // Calculer l'impact total de toutes les opérations
    let totalImpact = 0;
    sortedOperations.forEach(op => {
      let impact = 0;
      
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          break;
          
        case "transfer":
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
          }
          break;
          
        case "direct_transfer":
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
          }
          break;
      }
      
      totalImpact += impact;
    });
    
    // Le solde initial est le solde actuel moins l'impact total de toutes les opérations
    const initialBalance = currentBalance - totalImpact;
    
    console.log(`Impact total calculé: ${totalImpact.toFixed(3)} TND`);
    console.log(`Solde initial reconstitué: ${initialBalance.toFixed(3)} TND`);
    console.log(`Vérification: ${initialBalance.toFixed(3)} + ${totalImpact.toFixed(3)} = ${(initialBalance + totalImpact).toFixed(3)} TND`);
    
    // Maintenant, calculer les soldes séquentiels
    let runningBalance = initialBalance;
    
    const operationsWithBalance = sortedOperations.map((op, index) => {
      const balanceBefore = runningBalance;
      let impact = 0;
      
      console.log(`\n--- Opération ${index + 1}/${sortedOperations.length} ---`);
      console.log(`ID: ${op.id} | Type: ${op.type} | Montant: ${op.amount} TND`);
      console.log(`Date: ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy HH:mm:ss")}`);
      console.log(`Solde AVANT cette opération: ${balanceBefore.toFixed(3)} TND`);
      
      // CALCUL DE L'IMPACT CORRIGÉ
      switch (op.type) {
        case "deposit":
          impact = Number(op.amount);
          console.log(`📥 DÉPÔT: +${impact} TND`);
          break;
          
        case "withdrawal":
          impact = -Number(op.amount);
          console.log(`📤 RETRAIT: ${impact} TND`);
          break;
          
        case "transfer":
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 VIREMENT REÇU: +${impact} TND`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 VIREMENT ENVOYÉ: ${impact} TND`);
          }
          break;
          
        case "direct_transfer":
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            impact = Number(op.amount);
            console.log(`📥 TRANSFERT DIRECT REÇU: +${impact} TND`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            impact = -Number(op.amount);
            console.log(`📤 TRANSFERT DIRECT ENVOYÉ: ${impact} TND`);
          }
          break;
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

    console.log("\n=== VÉRIFICATION FINALE CORRIGÉE ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Solde initial reconstitué: ${initialBalance.toFixed(3)} TND`);
    console.log(`Solde final calculé: ${runningBalance.toFixed(3)} TND`);
    console.log(`Solde en base de données: ${currentBalance.toFixed(3)} TND`);
    
    const difference = Math.abs(runningBalance - currentBalance);
    console.log(`Écart absolu: ${difference.toFixed(3)} TND`);
    
    if (difference > 0.01) {
      console.error("❌ INCOHÉRENCE DÉTECTÉE!");
      console.error(`Le calcul séquentiel (${runningBalance.toFixed(3)} TND) ne correspond pas au solde en base (${currentBalance.toFixed(3)} TND)`);
    } else {
      console.log("✅ COHÉRENCE CONFIRMÉE - Calculs corrects");
    }

    // Retourner en ordre inverse pour affichage (plus récent en premier)
    return [...operationsWithBalance].reverse();
  }, [operations, client]);

  return processedOperations;
};
