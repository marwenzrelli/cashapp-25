
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Deposit } from "@/features/deposits/types";
import { Client } from "../types";

export function useClientOperations(client: Client, clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDeposit = async (deposit: Deposit) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Insérer le versement dans la base de données
      const {
        data: insertedDeposit,
        error
      } = await supabase.from('deposits').insert({
        client_name: deposit.client_name,
        amount: deposit.amount,
        operation_date: new Date(deposit.date).toISOString(),
        notes: deposit.description,
        created_by: session?.user?.id
      }).select();
      
      if (error) {
        console.error("Erreur lors de la création du versement:", error);
        toast.error("Erreur lors de la création du versement", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Versement effectué", {
        description: `Un versement de ${deposit.amount} TND a été ajouté pour ${deposit.client_name}`
      });
      
      // Rafraîchir manuellement le solde client
      const clientIdToRefresh = client?.id || clientId;
      if (clientIdToRefresh) {
        await refreshClientBalance(clientIdToRefresh);
      }
      
      // Invalider les requêtes mises en cache pour actualiser les listes d'opérations
      invalidateQueries();
      
      // Appeler la fonction de mise à jour si disponible
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors du versement:", error);
      toast.error("Erreur lors du traitement du versement");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawal = async (withdrawal: any) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Insérer le retrait dans la base de données
      const {
        data: insertedWithdrawal,
        error
      } = await supabase.from('withdrawals').insert({
        client_name: withdrawal.client_name,
        amount: withdrawal.amount,
        operation_date: new Date(withdrawal.date).toISOString(),
        notes: withdrawal.notes,
        created_by: session?.user?.id
      }).select();
      
      if (error) {
        console.error("Erreur lors de la création du retrait:", error);
        toast.error("Erreur lors de la création du retrait", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Retrait effectué", {
        description: `Un retrait de ${withdrawal.amount} TND a été effectué pour ${withdrawal.client_name}`
      });
      
      // Rafraîchir manuellement le solde client
      const clientIdToRefresh = client?.id || clientId;
      if (clientIdToRefresh) {
        await refreshClientBalance(clientIdToRefresh);
      }
      
      // Invalider les requêtes mises en cache pour actualiser les listes d'opérations
      invalidateQueries();
      
      // Appeler la fonction de mise à jour si disponible
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du traitement du retrait");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const refreshClientBalance = async (id: number | string) => {
    try {
      if (!id) {
        console.error("ID client non fourni pour le rafraîchissement du solde");
        return false;
      }
      
      console.log("Rafraîchissement du solde pour le client ID:", id);
      
      // Obtenir les informations du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', id)
        .single();
      
      if (clientError) {
        console.error("Erreur lors de la récupération du client:", clientError);
        return false;
      }
      
      if (!clientData) {
        console.error("Client non trouvé pour l'ID:", id);
        return false;
      }
      
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      
      // Obtenir le total des versements pour ce client
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (depositsError) {
        console.error("Erreur lors de la récupération des versements:", depositsError);
        return false;
      }
      
      // Obtenir le total des retraits pour ce client
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (withdrawalsError) {
        console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        return false;
      }
      
      // Calculer le solde manuellement
      const totalDeposits = deposits?.reduce((acc, dep) => acc + Number(dep.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => acc + Number(wd.amount), 0) || 0;
      const balance = totalDeposits - totalWithdrawals;
      
      console.log(`Solde calculé pour ${clientFullName}: 
        Versements: ${totalDeposits}, 
        Retraits: ${totalWithdrawals}, 
        Solde final: ${balance}`);
      
      // Mettre à jour le solde dans la base de données
      const { error: updateError } = await supabase
        .from('clients')
        .update({ solde: balance })
        .eq('id', id);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        return false;
      }
      
      // Invalider les requêtes mises en cache pour actualiser les informations du client
      invalidateQueries();
      
      return true;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      return false;
    }
  };
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', clientId] });
    }
  };
  
  return {
    isProcessing,
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance
  };
}
