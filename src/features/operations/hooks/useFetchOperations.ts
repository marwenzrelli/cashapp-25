
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
    return name.toLowerCase().trim();
  };

  const fetchAllOperations = async () => {
    try {
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

      console.log(`Raw data: ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
      
      // Special handling for "pepsi men" client (ID 4)
      // Find and log all withdrawals for this client
      const pepsiMenWithdrawals = withdrawals.filter(w => {
        const clientName = normalizeClientName(w.client_name);
        return clientName.includes('pepsi men') || 
               clientName.includes('pepsi') || 
               clientName.includes('men');
      });
      
      console.log(`Found ${pepsiMenWithdrawals.length} withdrawals for pepsi men:`, 
                  pepsiMenWithdrawals.map(w => ({ id: w.id, name: w.client_name, amount: w.amount })));
      
      // Known withdrawal IDs for "pepsi men"
      const pepsiMenWithdrawalIds = [72, 73, 74, 75, 76, 77, 78];
      
      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          operation_date: d.operation_date || d.created_at, // Use operation_date if available
          description: d.notes || `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.operation_date || d.created_at)
        })),
        ...withdrawals.map((w): Operation => {
          const isPepsiMen = pepsiMenWithdrawalIds.includes(w.id) || 
                            normalizeClientName(w.client_name).includes('pepsi') || 
                            normalizeClientName(w.client_name).includes('men');
          
          // For specific withdrawal IDs or if client name contains 'pepsi' or 'men',
          // explicitly set client name to "pepsi men" for consistency
          const clientName = isPepsiMen ? "pepsi men" : w.client_name;
          
          return {
            id: w.id.toString(),
            type: "withdrawal",
            amount: w.amount,
            date: w.created_at,
            createdAt: w.created_at,
            operation_date: w.operation_date || w.created_at, // Use operation_date if available
            description: w.notes || `Retrait par ${clientName}`,
            fromClient: clientName,
            formattedDate: formatDateTime(w.operation_date || w.created_at)
          };
        }),
        ...transfers.map((t): Operation => ({
          id: t.id.toString(),
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
          createdAt: t.created_at,
          operation_date: t.operation_date || t.created_at, // Use operation_date if available
          description: t.reason || `Virement de ${t.from_client} vers ${t.to_client}`,
          fromClient: t.from_client,
          toClient: t.to_client,
          formattedDate: formatDateTime(t.operation_date || t.created_at)
        }))
      ].sort((a, b) => {
        // Sort by operation_date if available, otherwise by createdAt or date
        const dateA = new Date(a.operation_date || a.createdAt || a.date).getTime();
        const dateB = new Date(b.operation_date || b.createdAt || b.date).getTime();
        return dateB - dateA;
      });

      // Count operations before deduplication
      console.log(`Total operations before deduplication: ${formattedOperations.length}`);
      console.log(`Withdrawals: ${formattedOperations.filter(op => op.type === "withdrawal").length}`);
      console.log(`Withdrawals for "pepsi men": ${formattedOperations.filter(op => 
          op.type === "withdrawal" && normalizeClientName(op.fromClient || '').includes("pepsi men")).length}`);
      
      // Dédupliquer les opérations avant de les retourner
      const uniqueOperations = deduplicateOperations(formattedOperations);
      
      if (uniqueOperations.length !== formattedOperations.length) {
        console.log(`Dédupliqué ${formattedOperations.length - uniqueOperations.length} opérations dans useFetchOperations`);
      }
      
      setOperations(uniqueOperations);
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
