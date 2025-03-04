
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { LogEntryRenderer, AuditLogEntry } from "./LogEntryRenderer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const UserActivityTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;

  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['user-activity', currentPage],
    queryFn: async () => {
      try {
        // Get total count for pagination
        const { data: countData, error: countError } = await supabase
          .from('profiles')
          .select('count', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Calculate total pages
        const totalItems = countData?.[0]?.count || 0;
        setTotalPages(Math.ceil(totalItems / logsPerPage));
        
        // Fetch user login activity with pagination
        const { data: loginData, error: loginError } = await supabase
          .from('profiles')
          .select('id, full_name, last_login')
          .order('last_login', { ascending: false })
          .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

        if (loginError) throw loginError;

        // Format login data for the audit log
        const formattedLoginData: AuditLogEntry[] = (loginData || []).map(user => ({
          id: `login-${user.id}`,
          action_type: 'Connexion',
          action_date: user.last_login ? format(new Date(user.last_login), "dd/MM/yyyy HH:mm:ss") : 'Jamais',
          performed_by: user.full_name,
          details: 'Connexion au système',
          target_id: user.id,
          target_name: user.full_name
        }));

        return formattedLoginData;
      } catch (error) {
        console.error("Erreur lors du chargement des logs d'audit:", error);
        toast.error("Erreur lors du chargement des logs d'audit");
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

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 h-[45vh]">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : auditLogs?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Aucune activité enregistrée
          </div>
        ) : (
          <div className="divide-y divide-border">
            {auditLogs?.map((log, index) => (
              <LogEntryRenderer key={log.id} entry={log} index={index} type="audit" />
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
