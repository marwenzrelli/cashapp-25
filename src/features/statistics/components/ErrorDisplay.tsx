
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  refreshData: () => void;
  isSyncing: boolean;
}

export const ErrorDisplay = ({ error, refreshData, isSyncing }: ErrorDisplayProps) => {
  return (
    <div className="p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold">Erreur de chargement</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            className="mt-4 flex items-center gap-2"
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
};
