
import { supabase } from "@/integrations/supabase/client";
import { Operation, formatDateTime } from "../types";
import { toast } from "sonner";

export const useFetchOperations = (
  setOperations: (operations: Operation[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  // Fonction utilitaire pour dédupliquer les opérations
  const deduplicateOperations = (operations: Operation[]): Operation[] => {
    const uniqueIds = new Map<string, Operation>();
    
    operations.forEach(op => {
      const id = op.id.toString();
      if (!uniqueIds.has(id)) {
        uniqueIds.set(id, op);
      }
    });
    
    return Array.from(uniqueIds.values());
  };

  // Helper function to normalize client names for consistent comparison
  const normalizeClientName = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase().trim();
  };

  // Helper function to check if a name contains 'pepsi men' or variations
  const isPepsiMenName = (name: string): boolean => {
    if (!name) return false;
    const normalized = normalizeClientName(name);
    return normalized.includes('pepsi') && normalized.includes('men');
  };

  // Log information about pepsi men operations
  const logPepsiOperations = (operations: Operation[]) => {
    // Find all operations related to pepsi men
    const pepsiOps = operations.filter(op => 
      op.client_id === 4 || 
      (op.fromClient && isPepsiMenName(op.fromClient)) || 
      (op.toClient && isPepsiMenName(op.toClient))
    );
    
    console.log(`Found ${pepsiOps.length} operations for pepsi men`);
    
    // Count by type
    const deposits = pepsiOps.filter(op => op.type === "deposit");
    const withdrawals = pepsiOps.filter(op => op.type === "withdrawal");
    const transfers = pepsiOps.filter(op => op.type === "transfer");
    
    console.log(`Pepsi men operations: ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
    
    // Log all withdrawal IDs
    const withdrawalIds = withdrawals.map(w => w.id).sort();
    console.log(`All pepsi men withdrawal IDs: ${withdrawalIds.join(', ')}`);
  };

  const fetchAllOperations = async () => {
    try {
      // Start loading
      setIsLoading(true);
      
      // Fetch all deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*, client_id')
        .order('created_at', { ascending: false });

      if (depositsError) {
        console.error("Error fetching deposits:", depositsError);
        throw depositsError;
      }

      // Fetch all withdrawals
      const { data: allWithdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
        // Continue to retrieve other data despite error
      }

      // Make a specific query for pepsi men withdrawals
      const { data: pepsiMenWithdrawals, error: pepsiMenError } = await supabase
        .from('withdrawals')
        .select('*')
        .or('client_id.eq.4,client_name.ilike.%pepsi%men%')
        .order('created_at', { ascending: false });

      if (pepsiMenError) {
        console.error("Error fetching pepsi men withdrawals:", pepsiMenError);
      } else if (pepsiMenWithdrawals) {
        console.log(`Found ${pepsiMenWithdrawals.length} specific withdrawals for pepsi men`);
      }

      // Fetch all transfers
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (transfersError) {
        console.error("Error fetching transfers:", transfersError);
        throw transfersError;
      }

      // Safety checks for null data
      const safeDeposits = deposits || [];
      const safeWithdrawals = allWithdrawals || [];
      const safePepsiWithdrawals = pepsiMenWithdrawals || [];
      const safeTransfers = transfers || [];
      
      // Log raw data counts
      console.log(`Raw data: ${safeDeposits.length} deposits, ${safeWithdrawals.length} withdrawals, ${safeTransfers.length} transfers`);
      console.log(`Pepsi men query found ${safePepsiWithdrawals.length} withdrawals`);
      
      // Combine all withdrawals, ensuring pepsi men withdrawals are included
      const combinedWithdrawals = [...safeWithdrawals];
      
      // Add pepsi men withdrawals that might be missing from the main query
      if (safePepsiWithdrawals.length > 0) {
        const existingIds = new Set(combinedWithdrawals.map(w => w.id.toString()));
        
        safePepsiWithdrawals.forEach(w => {
          if (!existingIds.has(w.id.toString())) {
            combinedWithdrawals.push(w);
            console.log(`Added missing pepsi men withdrawal with ID ${w.id}`);
          }
        });
        
        console.log(`Final combined withdrawals count: ${combinedWithdrawals.length}`);
      }
      
      // Map raw data to Operation objects
      const formattedOperations: Operation[] = [
        ...safeDeposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          operation_date: d.operation_date || d.created_at, 
          description: d.notes || `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.operation_date || d.created_at),
          client_id: d.client_id
        })),
        ...combinedWithdrawals.map((w): Operation => {
          // Special handling for pepsi men withdrawals
          const isPepsiMen = 
            (w.client_id === 4) || 
            (w.client_name && isPepsiMenName(w.client_name));
          
          // Always set client_id to 4 for pepsi men
          const clientId = isPepsiMen ? 4 : w.client_id;
          
          // Ensure consistent client name for pepsi men
          const clientName = isPepsiMen ? "pepsi men" : w.client_name;
          
          return {
            id: w.id.toString(),
            type: "withdrawal",
            amount: w.amount,
            date: w.created_at,
            createdAt: w.created_at,
            operation_date: w.operation_date || w.created_at,
            description: w.notes || `Retrait par ${clientName}`,
            fromClient: clientName,
            formattedDate: formatDateTime(w.operation_date || w.created_at),
            client_id: clientId
          };
        }),
        ...safeTransfers.map((t): Operation => ({
          id: t.id.toString(),
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
          createdAt: t.created_at,
          operation_date: t.operation_date || t.created_at,
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          formattedDate: formatDateTime(t.operation_date || t.created_at)
        }))
      ].sort((a, b) => {
        const dateA = new Date(a.operation_date || a.createdAt || a.date).getTime();
        const dateB = new Date(b.operation_date || b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      
      // Deduplicate operations before updating state
      const uniqueOperations = deduplicateOperations(formattedOperations);
      
      // Special logging for pepsi men operations
      logPepsiOperations(uniqueOperations);
      
      // Update state with deduplicated operations
      setOperations(uniqueOperations);
      
      // Log final operations count
      console.log(`Final operations count: ${uniqueOperations.length}`);
      
    } catch (error) {
      console.error("Erreur lors du chargement des opérations:", error);
      toast.error("Erreur lors du chargement des opérations");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAllOperations
  };
};
