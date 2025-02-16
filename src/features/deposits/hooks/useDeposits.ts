
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Deposit } from "../types";
import { useNavigate } from "react-router-dom";

export const useDeposits = () => {
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des versements");
        console.error("Erreur:", error);
        return;
      }

      const formattedDeposits: Deposit[] = data.map(d => ({
        id: d.id,
        client: d.client_name,
        amount: Number(d.amount),
        date: new Date(d.operation_date).toLocaleDateString(),
        description: d.notes || ''
      }));

      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Erreur lors du chargement des versements:", error);
      toast.error("Erreur lors du chargement des versements");
    } finally {
      setIsLoading(false);
    }
  };

  const createDeposit = async (deposit: Deposit) => {
    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          client_name: deposit.client,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description
        });

      if (error) {
        toast.error("Erreur lors de la création du versement");
        console.error("Erreur:", error);
        return false;
      }

      await fetchDeposits();
      toast.success("Nouveau versement créé", {
        description: `Un nouveau versement de ${deposit.amount} TND a été ajouté.`
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du versement");
      return false;
    }
  };

  const deleteDeposit = async (depositId: string) => {
    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', depositId);

      if (error) {
        toast.error("Erreur lors de la suppression du versement");
        console.error("Erreur:", error);
        return false;
      }

      setDeposits(prevDeposits =>
        prevDeposits.filter(deposit => deposit.id !== depositId)
      );

      toast.success("Versement supprimé", {
        description: `Le versement a été retiré de la base de données.`
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du versement");
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchDeposits();
      }
    };
    init();
  }, []);

  return {
    deposits,
    isLoading,
    createDeposit,
    deleteDeposit,
    fetchDeposits
  };
};
