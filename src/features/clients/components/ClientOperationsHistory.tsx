
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { Operation } from "@/features/operations/types";
import { OperationActionsDialog } from "./operations-history/OperationActionsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OperationsFilterButtons } from "./operations-history/OperationsFilterButtons";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ClientOperationsHistoryProps {
  operations: Operation[];
  selectedType: "all" | "deposits" | "withdrawals" | "transfers";
  setSelectedType: (type: "all" | "deposits" | "withdrawals" | "transfers") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
  filteredOperations: Operation[];
  refreshOperations: () => Promise<void>;
  clientId?: number;
  refetchClient?: () => Promise<void>;
}

export const ClientOperationsHistory = ({
  operations,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  isCustomRange,
  setIsCustomRange,
  filteredOperations,
  refreshOperations,
  clientId,
  refetchClient
}: ClientOperationsHistoryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [dialogMode, setDialogMode] = useState<'edit' | 'delete'>('edit');
  
  // Refresh operations on mount
  useEffect(() => {
    const loadOperations = async () => {
      if (operations.length === 0) {
        await refreshOperations();
      }
    };
    
    loadOperations();
  }, [operations.length, refreshOperations]);
  
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await refreshOperations();
      toast.success("Opérations actualisées");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des opérations:", error);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOperationAction = (operation: Operation, mode: 'edit' | 'delete') => {
    setSelectedOperation(operation);
    setDialogMode(mode);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = async () => {
    setIsDialogOpen(false);
    setSelectedOperation(null);
    
    // Refresh operations after dialog closes (especially important after deletions)
    if (refetchClient) {
      console.log("Actualisation des données après fermeture du dialogue");
      await refetchClient();
      await refreshOperations();
    }
  };
  
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Historique des opérations</h2>
            <p className="text-sm text-muted-foreground">
              Visualisez toutes les opérations associées à ce client
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="md:w-auto w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4">
          <Input
            placeholder="Rechercher une opération..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            isCustomRange={isCustomRange}
            setIsCustomRange={setIsCustomRange}
            className="w-full"
          />
        </div>
        
        <div className="flex overflow-auto pb-2">
          <OperationsFilterButtons
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <ClientOperationsHistoryTabs
            operations={filteredOperations}
            selectedType={selectedType}
            onEdit={(operation) => handleOperationAction(operation, 'edit')}
            onDelete={(operation) => handleOperationAction(operation, 'delete')}
          />
        )}
      </div>
      
      <OperationActionsDialog
        operation={selectedOperation}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        clientId={clientId}
        refetchClient={refetchClient}
        mode={dialogMode}
      />
    </div>
  );
};
