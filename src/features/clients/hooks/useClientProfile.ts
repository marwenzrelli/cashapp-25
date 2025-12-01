
import { useRef, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClientSpecificOperations } from "./useClientSpecificOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { useRealTimeBalance } from "./clientProfile/useRealTimeBalance";
import { useClientBalanceRefresh } from "./clientProfile/useClientBalanceRefresh";
import { useOperationsVerification } from "./clientProfile/useOperationsVerification";
import { Operation } from "@/features/operations/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useClientProfile = () => {
  const { id: clientIdParam } = useParams();
  const navigate = useNavigate();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Améliorer la validation de l'ID client
  const parsedClientId = useMemo(() => {
    console.log("Raw clientIdParam from useParams:", clientIdParam);
    
    if (!clientIdParam || clientIdParam === ':id' || clientIdParam === 'undefined') {
      console.error("ID client invalide ou manquant:", clientIdParam);
      return null;
    }
    
    const parsed = parseInt(clientIdParam, 10);
    if (isNaN(parsed) || parsed <= 0) {
      console.error("ID client non numérique ou invalide:", clientIdParam, "parsed:", parsed);
      return null;
    }
    
    console.log("Valid client ID parsed:", parsed);
    return parsed;
  }, [clientIdParam]);
  
  const isPepsiMen = useMemo(() => parsedClientId === 4, [parsedClientId]);
  
  console.log("useClientProfile - Raw ID from params:", clientIdParam, "Parsed client ID:", parsedClientId);
  
  // Redirection si l'ID est invalide
  useEffect(() => {
    if (clientIdParam && parsedClientId === null) {
      console.error("Redirection vers /clients à cause d'un ID invalide");
      navigate("/clients", { replace: true });
      toast.error("ID client invalide", {
        description: "L'identifiant du client n'est pas valide"
      });
    }
  }, [clientIdParam, parsedClientId, navigate]);
  
  const { client, isLoading, error, fetchClient } = useClientData(parsedClientId);
  
  const refetchClient = useCallback(() => {
    if (parsedClientId) {
      console.log("Manual refetch of client data for ID:", parsedClientId);
      fetchClient(parsedClientId);
    } else {
      console.error("Cannot refetch: No client ID available");
    }
  }, [parsedClientId, fetchClient]);
  
  // Use client-specific operations hook to load ALL operations for this client (no limits)
  const clientName = client ? `${client.prenom} ${client.nom}` : '';
  const { 
    operations, 
    refreshOperations,
    isLoading: isLoadingOperations 
  } = useClientSpecificOperations(parsedClientId || 0, clientName);
  
  const { realTimeBalance, setRealTimeBalance } = useRealTimeBalance(parsedClientId);
  
  const { refreshClientBalance } = useClientBalanceRefresh(
    parsedClientId, 
    client, 
    setRealTimeBalance, 
    refetchClient
  );
  
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
    setIsCustomRange,
    showAllDates,
    setShowAllDates,
    isPepsiMen: isPepsiClient
  } = useClientOperationsFilter(operations, client);
  
  useOperationsVerification(client, operations, clientOperations, refreshClientBalance);
  
  const { formatAmount, exportToExcel, exportToPDF } = useClientProfileExport(
    client, 
    clientOperations,
    qrCodeRef
  );

  const updateOperation = async (updatedOperation: Operation): Promise<void> => {
    try {
      console.log("Updating operation in profile page:", updatedOperation);
      
      const operationType = updatedOperation.type;
      const operationIdParts = updatedOperation.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        console.error("Invalid operation ID:", operationIdString);
        throw new Error("Format d'ID invalide");
      }
      
      let error = null;
      
      if (operationType === 'deposit') {
        const { error: updateError } = await supabase
          .from('deposits')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'withdrawal') {
        const { error: updateError } = await supabase
          .from('withdrawals')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'transfer') {
        const { error: updateError } = await supabase
          .from('transfers')
          .update({
            from_client: updatedOperation.fromClient,
            to_client: updatedOperation.toClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            reason: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      }
      
      if (error) {
        console.error("Error updating operation:", error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }
      
      await refreshClientOperations();
    } catch (error: any) {
      console.error("Error updating operation:", error);
      throw new Error(error?.message || "Échec de la mise à jour");
    }
  };

  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client?.solde;

  const refreshClientOperations = useCallback(async (): Promise<void> => {
    console.log("Refreshing operations for client:", client?.id);
    try {
      await refreshOperations();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (parsedClientId) {
        console.log("Actualisation du solde du client après rafraîchissement des opérations");
        await refreshClientBalance();
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des opérations:", error);
      toast.error("Erreur lors de l'actualisation des données");
      throw error;
    }
  }, [refreshOperations, client, parsedClientId, refreshClientBalance]);

  useEffect(() => {
    if (client && client.id) {
      refreshClientOperations().catch(error => {
        console.error("Error in initial operations refresh:", error);
      });
    }
  }, [client?.id]);

  return {
    client,
    clientId: parsedClientId,
    clientOperations,
    filteredOperations,
    isLoading: isLoading || isLoadingOperations,
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
    showAllDates,
    setShowAllDates,
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    refreshClientOperations,
    clientBalance: effectiveBalance,
    isPepsiMen,
    updateOperation
  };
};
