
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LogEntryRenderer, AuditLogEntry } from "./LogEntryRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeletedOperation {
  id: string;
  original_id: string;
  amount: number;
  client_name: string;
  deleted_by: string;
  deleted_at: string;
  notes: string | null;
  operation_date: string;
  status: string;
}

export const DeletedOperationsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const operationsPerPage = 10;

  const { 
    data: deletedOperations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['deleted-operations', currentPage],
    queryFn: async () => {
      try {
        // Get total count for pagination
        const { count, error: countError } = await supabase
          .from('deleted_withdrawals')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Calculate total pages
        const totalItems = count || 0;
        setTotalPages(Math.ceil(totalItems / operationsPerPage));
        
        // Fetch deleted operations with pagination
        const { data, error } = await supabase
          .from('deleted_withdrawals')
          .select('*')
          .order('deleted_at', { ascending: false })
          .range((currentPage - 1) * operationsPerPage, currentPage * operationsPerPage - 1);

        if (error) throw error;
        return data as DeletedOperation[] || [];
      } catch (error) {
        console.error("Error fetching deleted operations:", error);
        toast.error("Erreur lors du chargement des opérations supprimées");
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
  const formattedOperations: AuditLogEntry[] = deletedOperations?.map(op => ({
    id: op.id.toString(),
    action_type: "Suppression",
    action_date: op.deleted_at,
    performed_by: op.deleted_by,
    details: op.notes || "Opération supprimée",
    target_id: op.original_id?.toString() || '',
    target_name: op.client_name || ''
  })) || [];

  if (error) {
    toast.error("Erreur lors du chargement des opérations supprimées");
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
            Aucune opération supprimée enregistrée
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
