
import { useState, useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { OperationsList } from "./OperationsList";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface OperationsContentProps {
  filteredOperations: Operation[];
  isLoading: boolean;
  isFiltering: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsContent = ({ 
  filteredOperations, 
  isLoading, 
  isFiltering, 
  onDelete 
}: OperationsContentProps) => {
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when the filtered operations change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOperations.length]);
  
  // Calculate paginated operations directly to avoid recomputation
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const endIndex = startIndex + parseInt(itemsPerPage);
  const paginatedOperations = filteredOperations.slice(startIndex, endIndex);

  return (
    <>
      <TransferPagination
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={filteredOperations.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        label="opérations"
      />

      <OperationsList 
        operations={paginatedOperations} 
        isLoading={isLoading || isFiltering} 
        onDelete={onDelete} 
      />
      
      {isLoading && filteredOperations.length > 0 && (
        <div className="py-2 flex justify-center">
          <LoadingIndicator 
            text="Actualisation..." 
            size="sm" 
            fadeIn={false}
            showImmediately={true}
            debounceMs={0}
          />
        </div>
      )}
    </>
  );
};
