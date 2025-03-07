
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Operation } from "@/features/operations/types";
import { OperationDetailsView } from "./OperationDetailsView";
import { OperationEditForm } from "./OperationEditForm";
import { OperationDeleteConfirmation } from "./OperationDeleteConfirmation";

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
  // Early return if no operation
  if (!operation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {mode === 'edit' ? (
        <OperationEditForm 
          operation={operation}
          onClose={onClose}
          clientId={clientId}
          refetchClient={refetchClient}
        />
      ) : (
        <OperationDeleteConfirmation
          operation={operation}
          onClose={onClose}
          clientId={clientId}
          refetchClient={refetchClient}
        />
      )}
    </Dialog>
  );
};
