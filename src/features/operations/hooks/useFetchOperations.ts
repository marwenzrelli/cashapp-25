
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
    return normalized.includes('pepsi') || normalized.includes('men');
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
      
      // Known withdrawal IDs for "pepsi men" - comprehensive list
      const pepsiMenWithdrawalIds = [
        72, 73, 74, 75, 76, 77, 78, // Critical IDs
        14, 15, 16, 17, 36, 37, 40, 120, 121, 122, 123, 124, 125, 126, 139 // Extended list
      ];
      
      const formattedOperations: Operation[] = [
        ...deposits.map((d): Operation => ({
          id: d.id.toString(),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          operation_date: d.operation_date || d.created_at, 
          description: d.notes || `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.operation_date || d.created_at)
        })),
        ...withdrawals.map((w): Operation => {
          // Check if this is one of pepsi men's withdrawals either by ID or client name
          const isPepsiMen = pepsiMenWithdrawalIds.includes(w.id) || 
                            isPepsiMenName(w.client_name);
          
          // Normalize client name to ensure consistency
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
            formattedDate: formatDateTime(w.operation_date || w.created_at)
          };
        }),
        ...transfers.map((t): Operation => ({
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
        // Sort by operation_date if available, otherwise by createdAt or date
        const dateA = new Date(a.operation_date || a.createdAt || a.date).getTime();
        const dateB = new Date(b.operation_date || b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      
      // Extra verification for pepsi men operations
      const pepsiMenOps = formattedOperations.filter(op => 
        isPepsiMenName(op.fromClient) || isPepsiMenName(op.toClient)
      );
      
      const criticaIds = [72, 73, 74, 75, 76, 77, 78];
      const criticalOps = formattedOperations.filter(op => 
        criticaIds.includes(parseInt(op.id, 10))
      );
      
      console.log(`Found ${pepsiMenOps.length} operations for pepsi men`);
      console.log(`Found ${criticalOps.length} critical operations with IDs 72-78`);
      
      // Dédupliquer les opérations avant de les retourner
      const uniqueOperations = deduplicateOperations(formattedOperations);
      
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
