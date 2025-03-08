
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Operation } from "@/features/operations/types";
import { useOperationDialog } from "../../hooks/operations-dialog/useOperationDialog";
import { DeleteOperationConfirmation } from "./dialogs/DeleteOperationConfirmation";
import { EditOperationForm } from "./dialogs/EditOperationForm";
import { OperationDialogFooter } from "./dialogs/OperationDialogFooter";
import { useEffect } from "react";

interface OperationActionsDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  refetchClient?: () => void;
  mode: 'edit' | 'delete';
}

export const OperationActionsDialog = ({
  operation,
  isOpen,
  onClose,
  clientId,
  refetchClient,
  mode
}: OperationActionsDialogProps) => {
  const {
    amount,
    setAmount,
    notes,
    setNotes,
    loading,
    handleSubmit
  } = useOperationDialog(operation, mode, onClose, clientId, refetchClient);
  
  // Log when the dialog is opened or closed
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog opened for operation:", operation?.id, "mode:", mode);
    } else {
      console.log("Dialog closed");
    }
  }, [isOpen, operation, mode]);
  
  if (!operation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog open state changed to:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' 
              ? `Modifier ${operation.type === 'withdrawal' ? 'le retrait' : operation.type === 'deposit' ? 'le versement' : 'l\'opération'}`
              : `Supprimer ${operation.type === 'withdrawal' ? 'le retrait' : operation.type === 'deposit' ? 'le versement' : 'l\'opération'}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {mode === 'delete' ? (
              <DeleteOperationConfirmation 
                operation={operation} 
                loading={loading} 
              />
            ) : (
              <EditOperationForm
                operation={operation}
                amount={amount}
                setAmount={setAmount}
                notes={notes}
                setNotes={setNotes}
                loading={loading}
              />
            )}
          </div>
          
          <OperationDialogFooter
            mode={mode}
            loading={loading}
            onClose={onClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
