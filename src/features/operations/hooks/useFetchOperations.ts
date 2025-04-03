
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

  const fetchAllOperations = async () => {
    try {
      console.log("Fetching all operations from database...");
      setIsLoading(true);
      
      // Increase the default page size for deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit to ensure we get all operations

      if (depositsError) throw depositsError;
      console.log(`Retrieved ${deposits?.length || 0} deposits`);

      // Increase the default page size for withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit

      if (withdrawalsError) throw withdrawalsError;
      console.log(`Retrieved ${withdrawals?.length || 0} withdrawals`);

      // Increase the default page size for transfers
      const { data: transfers, error: transfersError } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit

      if (transfersError) throw transfersError;
      console.log(`Retrieved ${transfers?.length || 0} transfers`);

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
        ...withdrawals.map((w): Operation => ({
          id: w.id.toString(),
          type: "withdrawal",
          amount: w.amount,
          date: w.created_at,
          createdAt: w.created_at,
          operation_date: w.operation_date || w.created_at, // Use operation_date if available
          description: w.notes || `Retrait par ${w.client_name}`,
          fromClient: w.client_name,
          formattedDate: formatDateTime(w.operation_date || w.created_at)
        })),
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

      // Log operation IDs for debugging
      console.log("All operation IDs:", formattedOperations.map(op => op.id).join(", "));
      
      // Check specifically for operations 72-78
      const missingIds = ['72', '73', '74', '75', '76', '77', '78'];
      const foundMissingIds = formattedOperations
        .filter(op => missingIds.includes(op.id))
        .map(op => op.id);
        
      console.log(`Found previously missing operations: ${foundMissingIds.join(', ')}`);
      
      // Dédupliquer les opérations avant de les retourner
      const uniqueOperations = deduplicateOperations(formattedOperations);
      
      if (uniqueOperations.length !== formattedOperations.length) {
        console.log(`Dédupliqué ${formattedOperations.length - uniqueOperations.length} opérations dans useFetchOperations`);
      }
      
      console.log(`Setting ${uniqueOperations.length} unique operations`);
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
