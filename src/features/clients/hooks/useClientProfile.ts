
import { useRef, useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { checkClientOperations } from "./utils/checkClientOperations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operations } = useOperations();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const clientId = id ? Number(id) : null;
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  
  // Debug pour s'assurer que l'ID est analysé correctement
  console.log("useClientProfile - ID brut des paramètres:", id, "ID client analysé:", clientId);
  
  // Obtenir les données client
  const { client, isLoading, error, fetchClient } = useClientData(clientId);
  
  // Mettre en place un abonnement en temps réel pour le solde du client
  useEffect(() => {
    if (!clientId) return;
    
    console.log("Configuration de l'abonnement en temps réel pour le solde du client ID:", clientId);
    
    const channel = supabase
      .channel(`client-balance-${clientId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'solde' in payload.new) {
          console.log("Mise à jour du solde en temps réel reçue:", payload.new.solde);
          setRealTimeBalance(Number(payload.new.solde));
        }
      })
      .subscribe((status) => {
        console.log(`Statut d'abonnement en temps réel pour le client ${clientId}:`, status);
      });
      
    return () => {
      console.log("Nettoyage de l'abonnement en temps réel pour le solde");
      supabase.removeChannel(channel);
    };
  }, [clientId]);
  
  // Fonction pour récupérer manuellement les données client
  const refetchClient = useCallback(() => {
    if (clientId) {
      console.log("Récupération manuelle des données client pour l'ID:", clientId);
      fetchClient(clientId);
    } else {
      console.error("Impossible de récupérer: Aucun ID client disponible");
    }
  }, [clientId, fetchClient]);
  
  // Filtrer les opérations
  const {
    clientOperations,
    filteredOperations,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange
  } = useClientOperationsFilter(operations, client);
  
  // Fonctionnalité d'exportation
  const { formatAmount, exportToExcel, exportToPDF } = useClientProfileExport(
    client, 
    clientOperations,
    qrCodeRef
  );
  
  // Vérifier les opérations si le client se charge mais qu'aucune opération n'est trouvée
  useEffect(() => {
    const verifyClientOperations = async () => {
      if (client && operations.length > 0 && clientOperations.length === 0) {
        console.log("Client trouvé mais aucune opération correspondante. Vérification des opérations...");
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        const opsCheck = await checkClientOperations(clientFullName, client.id);
        
        if (opsCheck.totalCount > 0) {
          console.log(`Trouvé ${opsCheck.totalCount} opérations dans la base de données, mais aucune correspondance en mémoire. 
          Cela suggère une incompatibilité de format du nom du client.`);
          
          // Rafraîchir le solde du client pour s'assurer qu'il est à jour
          await refreshClientBalance();
        }
      }
    };
    
    verifyClientOperations();
  }, [client, operations, clientOperations]);

  // Rafraîchir le solde du client manuellement
  const refreshClientBalance = async () => {
    if (!clientId || !client) return;
    
    try {
      console.log("Rafraîchissement manuel du solde du client:", clientId);
      
      const clientFullName = `${client.prenom} ${client.nom}`;
      
      // Obtenir tous les versements du client
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (depositsError) {
        console.error("Erreur lors de la récupération des versements:", depositsError);
        return;
      }
      
      // Obtenir tous les retraits du client
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (withdrawalsError) {
        console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        return;
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
        .eq('id', clientId);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        toast.error("Erreur lors de la mise à jour du solde");
        return;
      }
      
      // Mettre à jour le solde en temps réel localement
      setRealTimeBalance(balance);
      
      toast.success("Solde client mis à jour avec succès");
      
      // Récupérer les données client à nouveau
      refetchClient();
      
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      toast.error("Erreur lors du rafraîchissement du solde");
    }
  };

  // Obtenir le solde effectif (en temps réel ou à partir de l'objet client)
  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client?.solde;

  return {
    client,
    clientId,
    clientOperations,
    filteredOperations,
    isLoading,
    error,
    navigate,
    qrCodeRef,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    clientBalance: effectiveBalance
  };
};
