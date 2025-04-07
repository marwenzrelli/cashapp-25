
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface OperationsEmptyStateProps {
  onRefresh?: () => void;
}

export const OperationsEmptyState = ({ onRefresh }: OperationsEmptyStateProps) => {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
      <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-muted-foreground mb-4">
        Aucune opération trouvée. Créez des versements, retraits ou virements pour les voir ici.
      </p>
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      )}
    </div>
  );
};
