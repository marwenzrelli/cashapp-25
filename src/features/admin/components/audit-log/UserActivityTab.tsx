
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { LogEntryRenderer, AuditLogEntry } from "./LogEntryRenderer";

export const UserActivityTab = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoginActivity = async () => {
      try {
        setIsLoading(true);
        // Fetch user login activity
        const { data: loginData, error: loginError } = await supabase
          .from('profiles')
          .select('id, full_name, last_login')
          .order('last_login', { ascending: false })
          .limit(50);

        if (loginError) throw loginError;

        // Format login data for the audit log
        const formattedLoginData = loginData.map(user => ({
          id: `login-${user.id}`,
          action_type: 'Connexion',
          action_date: user.last_login ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm') : 'Jamais',
          performed_by: user.full_name,
          details: 'Connexion au système',
          target_id: user.id,
          target_name: user.full_name
        }));

        setAuditLogs(formattedLoginData);
      } catch (error) {
        console.error("Erreur lors du chargement des logs d'audit:", error);
        toast.error("Erreur lors du chargement des logs d'audit");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoginActivity();
  }, []);

  return (
    <ScrollArea className="h-[50vh]">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Aucune activité enregistrée
        </div>
      ) : (
        <div className="divide-y divide-border">
          {auditLogs.map((log, index) => (
            <LogEntryRenderer key={log.id} entry={log} index={index} type="audit" />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};
