
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { subDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  
  // State for client data
  const [client, setClient] = useState<Client | null>(null);
  const [clientOperations, setClientOperations] = useState<Operation[]>([]);
  const [clientBalance, setClientBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Fetch client data
  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching client data for ID: ${clientId}`);
      
      // First, check if ID is valid
      if (isNaN(clientId) || clientId <= 0) {
        throw new Error(`ID client invalide: ${clientId}`);
      }
      
      // Check if the client exists before trying to fetch it
      console.log("Checking if client exists...");
      const { count, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('id', clientId);
        
      if (countError) {
        console.error("Error checking if client exists:", countError);
        throw new Error(`Erreur lors de la vérification du client: ${countError.message}`);
      }
      
      if (count === 0) {
        console.error(`No client exists with ID ${clientId}`);
        throw new Error(`Le client avec l'identifiant ${clientId} n'existe pas dans notre système.`);
      }
      
      console.log(`Client with ID ${clientId} exists, count: ${count}`);
      
      // Now fetch the client data
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching client:", error);
        setError(`Erreur de récupération des données: ${error.message}`);
        toast.error("Erreur", {
          description: "Impossible de récupérer les données du client."
        });
        setClient(null);
      } else if (!data) {
        console.warn("No client found with ID:", clientId);
        setError(`Le client avec l'identifiant ${clientId} n'existe pas ou a été supprimé.`);
        setClient(null);
      } else {
        console.log("Client data retrieved:", data);
        setClient(data as Client);
        setClientBalance(data.solde || 0);
        setError(null);
      }
    } catch (err: any) {
      console.error("Exception during client fetch:", err);
      setError(err.message || "Une erreur inattendue s'est produite");
      setClient(null);
      toast.error("Erreur de chargement", {
        description: err.message || "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);
  
  // Fetch client operations
  const fetchClientOperations = useCallback(async () => {
    if (!clientId || !client) return;
    
    console.log("Fetching operations for client:", clientId);
    
    try {
      const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
      
      // Fetch all types of operations
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (depositsError) throw depositsError;
      
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (withdrawalsError) throw withdrawalsError;
      
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (transfersError) throw transfersError;
      
      // Format and filter operations for this client
      const allOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          operation_date: d.operation_date || d.created_at,
          description: d.notes || `Versement de ${d.client_name}`,
          fromClient: d.client_name
        })),
        ...withdrawals.map((w): Operation => ({
          id: w.id.toString(),
          type: "withdrawal",
          amount: w.amount,
          date: w.created_at,
          createdAt: w.created_at,
          operation_date: w.operation_date || w.created_at,
          description: w.notes || `Retrait par ${w.client_name}`,
          fromClient: w.client_name
        })),
        ...transfers.map((t): Operation => ({
          id: t.id.toString(),
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
          createdAt: t.created_at,
          operation_date: t.operation_date || t.created_at,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client
        }))
      ].sort((a, b) => {
        const dateA = new Date(a.operation_date || a.createdAt || a.date).getTime();
        const dateB = new Date(b.operation_date || b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      
      // Filter operations for this client only
      const clientOperations = allOperations.filter(operation => {
        const fromClient = operation.fromClient?.toLowerCase().trim() || '';
        const toClient = operation.toClient?.toLowerCase().trim() || '';
        
        const isFromClient = fromClient.includes(clientFullName) || clientFullName.includes(fromClient);
        const isToClient = operation.type === 'transfer' && (toClient.includes(clientFullName) || clientFullName.includes(toClient));
        
        return isFromClient || isToClient;
      });
      
      console.log(`Found ${clientOperations.length} operations for client: ${clientFullName}`);
      setClientOperations(clientOperations);
      
    } catch (error: any) {
      console.error("Error fetching client operations:", error);
      toast.error("Erreur", {
        description: "Impossible de récupérer l'historique des opérations"
      });
    }
  }, [clientId, client]);
  
  // Filter operations based on type, search term, and date range
  const filteredOperations = clientOperations.filter(op => {
    // Filter by type
    if (selectedType !== "all") {
      if (selectedType === "deposits" && op.type !== "deposit") return false;
      if (selectedType === "withdrawals" && op.type !== "withdrawal") return false;
      if (selectedType === "transfers" && op.type !== "transfer") return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const descriptionMatch = op.description?.toLowerCase().includes(searchLower);
      const typeMatch = op.type.toLowerCase().includes(searchLower);
      const amountMatch = op.amount.toString().includes(searchLower);
      
      if (!(descriptionMatch || typeMatch || amountMatch)) {
        return false;
      }
    }
    
    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      const opDate = new Date(op.operation_date || op.createdAt || op.date);
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);
      
      if (opDate < startDate || opDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Setup balance refresh functionality
  const refreshClientBalance = async () => {
    if (!clientId) return false;
    
    try {
      console.log(`Refreshing balance for client ID: ${clientId}`);
      
      // Fetch latest client data to get updated balance
      const { data, error } = await supabase
        .from('clients')
        .select('solde')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) {
        console.error("Error refreshing client balance:", error);
        throw error;
      }
      
      if (data) {
        console.log("Updated balance:", data.solde);
        setClientBalance(data.solde || 0);
        
        // Update client with new balance
        if (client) {
          setClient({
            ...client,
            solde: data.solde
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Erreur", {
        description: "Impossible d'actualiser le solde"
      });
      return false;
    }
  };
  
  // Function to refetch everything about the client
  const refetchClient = useCallback(async () => {
    console.log("Refetching all client data for client ID:", clientId);
    if (clientId) {
      // Invalidate all client-related queries
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', clientId] });
      
      // Fetch fresh data
      await fetchClient();
      await fetchClientOperations();
    }
  }, [clientId, fetchClient, fetchClientOperations, queryClient]);
  
  // Initialize data on mount
  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId, fetchClient]);
  
  // Fetch operations after client data is loaded
  useEffect(() => {
    if (client) {
      fetchClientOperations();
    }
  }, [client, fetchClientOperations]);
  
  // Function to format currency amounts
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Export functions
  const exportToExcel = () => {
    console.log("Export to Excel not implemented yet");
    toast.info("Export Excel", {
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };
  
  const exportToPDF = () => {
    console.log("Export to PDF not implemented yet");
    toast.info("Export PDF", {
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };
  
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
    refreshClientOperations: fetchClientOperations,
    clientBalance
  };
};
