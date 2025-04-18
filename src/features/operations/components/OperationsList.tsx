
import { Operation } from "../types";
import { OperationCard } from "./OperationCard";
import { TotalsSection } from "./TotalsSection";
import { CircleSlash } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface OperationsListProps {
  operations: Operation[];
  isLoading: boolean;
  showEmptyMessage?: boolean;
  onDelete: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
}

export const OperationsList = ({ 
  operations, 
  isLoading, 
  showEmptyMessage = true,
  onDelete,
  onEdit
}: OperationsListProps) => {
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  
  // Early return for empty operations with message
  if (operations.length === 0 && !isLoading && showEmptyMessage) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <div className="flex justify-center">
          <CircleSlash className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Aucune opération trouvée</h3>
        <p className="mt-2 text-muted-foreground">
          Aucune opération ne correspond à ces critères de recherche.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 print:space-y-2">
      <div className="grid grid-cols-1 gap-4 print:gap-1">
        {operations.map((operation) => (
          <OperationCard 
            key={operation.id} 
            operation={operation} 
            currency={currency}
            onDelete={onDelete}
            onEdit={onEdit}
            isMobile={isMobile}
          />
        ))}
      </div>

      {operations.length > 0 && (
        <TotalsSection operations={operations} currency={currency} />
      )}
    </div>
  );
};
