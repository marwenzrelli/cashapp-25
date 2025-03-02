
import { useState } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { DateRange } from "react-day-picker";
import { formatDateTime } from "@/features/operations/types";
import { Operation } from "@/features/operations/types";
import { OperationsList } from "@/features/operations/components/OperationsList";
import { OperationsHeader } from "@/features/operations/components/OperationsHeader";
import { generatePDF } from "@/features/operations/utils/pdf-generator";
import { operationMatchesSearch } from "@/features/operations/utils/display-helpers";

const Operations = () => {
  const { 
    operations, 
    isLoading, 
    deleteOperation, 
    showDeleteDialog, 
    setShowDeleteDialog, 
    confirmDeleteOperation,
    operationToDelete
  } = useOperations();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredOperations = operations.filter((op) => {
    const matchesType = !filterType || op.type === filterType;
    
    // Enhanced search using the new utility function
    const matchesClient = operationMatchesSearch(op, filterClient);
    
    const matchesDate =
      (!dateRange?.from ||
        new Date(op.date) >= new Date(dateRange.from)) &&
      (!dateRange?.to ||
        new Date(op.date) <= new Date(dateRange.to));
    
    return matchesType && matchesClient && matchesDate;
  });

  // Format dates for display
  const operationsWithFormattedDates = filteredOperations.map(op => ({
    ...op,
    formattedDate: formatDateTime(op.date)
  }));

  // Export PDF functionality
  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  // Wrapper for confirmDeleteOperation to match the expected signature
  const handleDeleteOperation = async (id: string | number) => {
    await confirmDeleteOperation();
    return true; // Return true to indicate successful deletion
  };

  return (
    <div className="space-y-6">
      <OperationsHeader 
        onExportPDF={handleExportPDF} 
        onPrint={() => window.print()} 
      />

      <OperationFilters
        type={filterType}
        setType={setFilterType}
        client={filterClient}
        setClient={setFilterClient}
        date={dateRange}
        setDate={setDateRange}
      />

      <OperationsList 
        operations={operationsWithFormattedDates} 
        isLoading={isLoading} 
        onDelete={deleteOperation} 
      />
      
      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteOperation}
        operation={operationToDelete}
      />
    </div>
  );
};

export default Operations;
