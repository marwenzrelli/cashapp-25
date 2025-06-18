
import { Operation } from "../types";
import { OperationsList } from "./OperationsList";
import { DeleteOperationDialog } from "./DeleteOperationDialog";

interface OperationsContentProps {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onDelete: (operation: Operation) => void;
  showDeleteDialog: boolean;
  onDeleteDialogClose: () => void;
  onConfirmDelete: () => Promise<boolean>;
  operationToDelete: Operation | undefined;
}

export const OperationsContent = ({
  operations,
  isLoading,
  error,
  onRefresh,
  onDelete,
  showDeleteDialog,
  onDeleteDialogClose,
  onConfirmDelete,
  operationToDelete
}: OperationsContentProps) => {
  return (
    <div className="space-y-6 print:mt-0">
      <OperationsList 
        operations={operations} 
        isLoading={isLoading} 
        showEmptyMessage={!isLoading && operations.length === 0}
        onDelete={onDelete}
        onEdit={() => {}} // Placeholder for edit functionality
      />
      
      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={onDeleteDialogClose}
        onDelete={onConfirmDelete}
        operation={operationToDelete}
      />
    </div>
  );
};
