
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { SystemAuditLog } from "@/features/admin/components/SystemAuditLog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const AuditLogSection = () => {
  const queryClient = useQueryClient();

  const refreshAuditLogs = () => {
    toast.info("Rafraîchissement des journaux d'activité en cours...");
    queryClient.invalidateQueries({ queryKey: ['deleted-operations'] });
    queryClient.invalidateQueries({ queryKey: ['recent-operations'] });
    
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['deleted-operations'] });
      queryClient.refetchQueries({ queryKey: ['recent-operations'] });
      toast.success("Journaux d'activité mis à jour");
    }, 500);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Journal d'activité du système</h2>
        <Button onClick={refreshAuditLogs} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
          <RefreshCw className="h-4 w-4" />
          Rafraîchir les journaux
        </Button>
      </div>
      <SystemAuditLog />
    </>
  );
};
