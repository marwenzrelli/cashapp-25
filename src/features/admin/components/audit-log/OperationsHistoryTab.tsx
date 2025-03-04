
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LogEntryRenderer, AuditLogEntry } from "./LogEntryRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define the type for operations history
interface OperationHistory {
  id: number;
  operation_type: string;
  created_at: string;
  performed_by: string;
  details: string;
  target_id: number | null;
  target_name: string | null;
}

export const OperationsHistoryTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const operationsPerPage = 10;

  const { 
    data: recentOperations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['recent-operations', currentPage],
    queryFn: async () => {
      try {
        // Get total count for pagination
        const { data: countData, error: countError } = await supabase
          .from('withdrawals')
          .select('count', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Calculate total pages
        const totalItems = countData?.[0]?.count || 0;
        setTotalPages(Math.ceil(totalItems / operationsPerPage));
        
        // Fetch operations with pagination
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * operationsPerPage, currentPage * operationsPerPage - 1);

        if (error) throw error;
        
        // Format the data to match the expected OperationHistory structure
        const formattedData: OperationHistory[] = (data || []).map(withdrawal => ({
          id: withdrawal.id,
          operation_type: 'Retrait',
          created_at: withdrawal.created_at,
          performed_by: withdrawal.created_by || 'Utilisateur système',
          details: `Retrait de ${withdrawal.amount} pour ${withdrawal.client_name}`,
          target_id: withdrawal.id,
          target_name: withdrawal.client_name
        }));
        
        return formattedData;
      } catch (error) {
        console.error("Error fetching recent operations:", error);
        toast.error("Erreur lors du chargement des opérations récentes");
        return [];
      }
    }
  });

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Format the operations data for the log renderer
  const formattedOperations: AuditLogEntry[] = recentOperations?.map(op => ({
    id: op.id.toString(),
    action_type: op.operation_type,
    action_date: op.created_at,
    performed_by: op.performed_by,
    details: op.details,
    target_id: op.target_id?.toString() || '',
    target_name: op.target_name || ''
  })) || [];

  if (error) {
    toast.error("Erreur lors du chargement des opérations récentes");
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-[45vh]">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : formattedOperations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Aucune opération enregistrée
          </div>
        ) : (
          <div className="divide-y divide-border">
            {formattedOperations.map((log, index) => (
              <LogEntryRenderer key={log.id} entry={log} index={index} type="operation" />
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages || isLoading}
            className="h-8"
          >
            Suivant <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
