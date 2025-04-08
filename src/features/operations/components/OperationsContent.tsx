
import { useState, useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { OperationsList } from "./OperationsList";

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
  
  // Reset à la page 1 quand les opérations filtrées changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOperations.length]);
  
  useEffect(() => {
    console.log(`OperationsContent: Displaying page ${currentPage} of ${Math.ceil(filteredOperations.length / parseInt(itemsPerPage))} pages (${itemsPerPage} items per page)`);
  }, [currentPage, itemsPerPage, filteredOperations.length]);
  
  // Calculer les opérations paginées directement
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
        isLoading={isLoading} 
        onDelete={onDelete} 
        totalOperations={filteredOperations.length}
      />
    </>
  );
};
