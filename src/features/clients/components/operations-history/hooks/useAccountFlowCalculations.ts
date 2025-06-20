
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
    
    console.log("=== CALCUL FLUX UNIFORME POUR TOUS CLIENTS ===");
    console.log(`Client: ${clientFullName} (ID: ${clientId})`);
    
    // Filtrer les opérations pour ce client
    const clientOperations = operations.filter(op => {
      const matchesClientId = op.client_id === clientId;
      const matchesFromClientId = op.from_client_id === clientId;
      const matchesToClientId = op.to_client_id === clientId;
      const matchesFromClientName = op.fromClient === clientFullName;
      const matchesToClientName = op.toClient === clientFullName;
      
      return matchesClientId || matchesFromClientId || matchesToClientId || 
             matchesFromClientName || matchesToClientName;
    });
    
    console.log(`Opérations trouvées: ${clientOperations.length}`);
    
    if (clientOperations.length === 0) {
      return [];
    }

    // Trier par date (plus ancien en premier)
    const sortedOperations = [...clientOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      
      if (dateA === dateB) {
        return a.id.localeCompare(b.id);
      }
      
      return dateA - dateB;
    });

    // LOGIQUE UNIFORME: Tous les clients commencent à 0
    console.log("\n=== CALCUL UNIFORME DEPUIS 0 POUR TOUS CLIENTS ===");
    let currentBalance = 0;
    
    const processedOps = sortedOperations.map((op, index) => {
      const balanceBefore = currentBalance;
      let balanceChange = 0;
      
      // Calculer l'impact selon le type d'opération
      switch (op.type) {
        case "deposit":
          balanceChange = Number(op.amount);
          console.log(`[${index + 1}] Dépôt: +${balanceChange} TND`);
          break;
          
        case "withdrawal":
          balanceChange = -Number(op.amount);
          console.log(`[${index + 1}] Retrait: ${balanceChange} TND`);
          break;
          
        case "transfer":
        case "direct_transfer":
          // Logique uniforme pour tous les clients
          if (op.toClient === clientFullName || op.to_client_id === clientId) {
            // Virement REÇU = POSITIF (ENTRÉE)
            balanceChange = Number(op.amount);
            console.log(`[${index + 1}] Virement REÇU: +${balanceChange} TND (de ${op.fromClient || 'inconnu'})`);
          } else if (op.fromClient === clientFullName || op.from_client_id === clientId) {
            // Virement ENVOYÉ = NÉGATIF (SORTIE)
            balanceChange = -Number(op.amount);
            console.log(`[${index + 1}] Virement ENVOYÉ: ${balanceChange} TND (vers ${op.toClient || 'inconnu'})`);
          } else {
            // Cas ambigu - ne devrait pas arriver avec le bon filtrage
            balanceChange = 0;
            console.log(`[${index + 1}] Virement AMBIGU: 0 TND`);
          }
          break;
          
        default:
          balanceChange = 0;
          console.log(`[${index + 1}] Type inconnu: 0 TND`);
      }
      
      const balanceAfter = balanceBefore + balanceChange;
      currentBalance = balanceAfter;
      
      console.log(`[${index + 1}] ${format(new Date(op.operation_date || op.date), "dd/MM/yyyy")} | ${op.type} | Avant: ${balanceBefore} | Change: ${balanceChange >= 0 ? '+' : ''}${balanceChange} | Après: ${balanceAfter}`);
      
      return {
        ...op,
        balanceBefore: Number(balanceBefore.toFixed(3)),
        balanceAfter: Number(balanceAfter.toFixed(3)),
        balanceChange: Number(balanceChange.toFixed(3))
      };
    });

    console.log(`\n=== RÉSULTAT FINAL UNIFORME ===`);
    console.log(`Client: ${clientFullName}`);
    console.log(`Solde calculé final: ${currentBalance.toFixed(3)} TND`);
    console.log(`Solde en base: ${Number(client.solde).toFixed(3)} TND`);
    console.log(`Différence: ${(currentBalance - Number(client.solde)).toFixed(3)} TND`);
    
    // Retourner en ordre inverse pour affichage (plus récent en premier)
    return [...processedOps].reverse();
  }, [operations, client]);

  return processedOperations;
};
