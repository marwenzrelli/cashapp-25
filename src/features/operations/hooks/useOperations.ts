
import { useState, useEffect } from "react";
import { Operation } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllOperations = async () => {
    try {
      // Récupérer les versements
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('operation_date', { ascending: false });

      if (depositsError) throw depositsError;

      // Récupérer les retraits
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('operation_date', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Récupérer les virements
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('operation_date', { ascending: false });

      if (transfersError) throw transfersError;

      // Transformer les données en format unifié
      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.operation_date,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          date: w.operation_date,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name
        })),
        ...transfers.map((t): Operation => ({
          id: t.id,
          type: "transfer",
          amount: t.amount,
          date: t.operation_date,
          description: t.reason,
          fromClient: t.from_client,
          toClient: t.to_client
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setOperations(formattedOperations);
    } catch (error) {
      console.error("Erreur lors du chargement des opérations:", error);
      toast.error("Erreur lors du chargement des opérations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOperations();
  }, []);

  return {
    operations,
    isLoading,
    fetchOperations: fetchAllOperations
  };
};
