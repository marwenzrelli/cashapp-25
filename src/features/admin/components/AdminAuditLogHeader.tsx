
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AdminAuditLogHeaderProps {
  onRefreshLogs: () => void;
}

export const AdminAuditLogHeader = ({ onRefreshLogs }: AdminAuditLogHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Journal d'activité du système</h2>
      <Button onClick={onRefreshLogs} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
        <RefreshCw className="h-4 w-4" />
        Rafraîchir les journaux
      </Button>
    </div>
  );
};
