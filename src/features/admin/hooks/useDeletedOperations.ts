
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/features/operations/types";
import { AuditLogEntry, OperationLogEntry } from "../components/audit-log/LogEntryRenderer";

export const useDeletedOperations = () => {
  const [data, setData] = useState<(AuditLogEntry | OperationLogEntry)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeletedOperations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les dépôts supprimés
      const { data: deletedDeposits, error: depositsError } = await supabase
        .from("deleted_deposits")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (depositsError) throw depositsError;

      // Récupérer les retraits supprimés
      const { data: deletedWithdrawals, error: withdrawalsError } = await supabase
        .from("deleted_withdrawals")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les transferts supprimés
      const { data: deletedTransfers, error: transfersError } = await supabase
        .from("deleted_transfers")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (transfersError) throw transfersError;

      // Récupérer les opérations directes supprimées
      const { data: deletedDirectOperations, error: directOperationsError } = await supabase
        .from("deleted_direct_operations")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (directOperationsError) throw directOperationsError;

      // Récupérer les informations d'utilisateur pour les associer aux opérations
      const uniqueUserIds = new Set([
        ...deletedDeposits.map(d => d.deleted_by),
        ...deletedWithdrawals.map(w => w.deleted_by),
        ...deletedTransfers.map(t => t.deleted_by),
        ...deletedDirectOperations.map(directOp => directOp.deleted_by)
      ].filter(Boolean));

      const userMap = new Map();
      
      for (const userId of uniqueUserIds) {
        if (!userId) continue;
        
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", userId)
          .single();
          
        if (!userError && userData) {
          userMap.set(userId, {
            name: userData.full_name || userData.email || "Utilisateur inconnu",
            email: userData.email
          });
        }
      }

      // Transformer les données pour le format d'affichage
      const formattedDeposits = deletedDeposits.map(deposit => {
        const userName = deposit.deleted_by && userMap.get(deposit.deleted_by)
          ? userMap.get(deposit.deleted_by).name
          : "Système";
          
        return {
          id: deposit.id.toString(),
          type: "deposit",
          amount: deposit.amount,
          date: formatDateTime(deposit.deleted_at),
          client_name: deposit.client_name,
          created_by: deposit.deleted_by || "",
          created_by_name: userName,
          description: deposit.notes || `Versement supprimé de ${deposit.client_name}`
        };
      });

      const formattedWithdrawals = deletedWithdrawals.map(withdrawal => {
        const userName = withdrawal.deleted_by && userMap.get(withdrawal.deleted_by)
          ? userMap.get(withdrawal.deleted_by).name
          : "Système";
          
        return {
          id: withdrawal.id.toString(),
          type: "withdrawal",
          amount: withdrawal.amount,
          date: formatDateTime(withdrawal.deleted_at),
          client_name: withdrawal.client_name,
          created_by: withdrawal.deleted_by || "",
          created_by_name: userName,
          description: withdrawal.notes || `Retrait supprimé de ${withdrawal.client_name}`
        };
      });

      const formattedTransfers = deletedTransfers.map(transfer => {
        const userName = transfer.deleted_by && userMap.get(transfer.deleted_by)
          ? userMap.get(transfer.deleted_by).name
          : "Système";
          
        return {
          id: transfer.id.toString(),
          type: "transfer",
          amount: transfer.amount,
          date: formatDateTime(transfer.deleted_at),
          from_client: transfer.from_client,
          to_client: transfer.to_client,
          created_by: transfer.deleted_by || "",
          created_by_name: userName,
          description: transfer.reason || `Virement supprimé de ${transfer.from_client} vers ${transfer.to_client}`
        };
      });

      const formattedDirectOperations = deletedDirectOperations.map(directOp => {
        const userName = directOp.deleted_by && userMap.get(directOp.deleted_by)
          ? userMap.get(directOp.deleted_by).name
          : "Système";
          
        return {
          id: directOp.id.toString(),
          type: "direct_transfer",
          amount: directOp.amount,
          date: formatDateTime(directOp.deleted_at),
          from_client: directOp.from_client_name,
          to_client: directOp.to_client_name,
          created_by: directOp.deleted_by || "",
          created_by_name: userName,
          description: directOp.notes || `Opération directe supprimée de ${directOp.from_client_name} vers ${directOp.to_client_name}`
        };
      });

      // Combiner toutes les données et trier par date
      const allDeletedOperations = [
        ...formattedDeposits,
        ...formattedWithdrawals,
        ...formattedTransfers,
        ...formattedDirectOperations
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData(allDeletedOperations);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des opérations supprimées:", error);
      setError(error.message || "Une erreur est survenue lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedOperations();
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchDeletedOperations
  };
};
