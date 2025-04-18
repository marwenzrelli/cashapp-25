
import { Operation } from "../types";
import { OperationsList } from "./OperationsList";

interface OperationsContentProps {
  filteredOperations: Operation[];
  isLoading: boolean;
  isFiltering: boolean;
  onDelete: (operation: Operation) => void;
  onEdit: (operation: Operation) => void;
}

export const OperationsContent = ({
  filteredOperations,
  isLoading,
  isFiltering,
  onDelete,
  onEdit
}: OperationsContentProps) => {
  return (
    <div className="space-y-6 print:mt-0">
      <OperationsList 
        operations={filteredOperations} 
        isLoading={isLoading} 
        showEmptyMessage={isFiltering}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
};
