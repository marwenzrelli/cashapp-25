
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatNumber } from "@/features/clients/components/operations-history/all-operations/OperationTypeHelpers";
import { useState } from "react";
import { EditOperationDialog } from "./EditOperationDialog";

interface OperationDetailsModalProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
}

export const OperationDetailsModal = ({
  operation,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: OperationDetailsModalProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!operation) return null;

  const displayDate = operation.operation_date || operation.date;
  const formattedDate = typeof displayDate === 'string'
    ? format(new Date(displayDate), "dd/MM/yyyy HH:mm")
    : format(displayDate, "dd/MM/yyyy HH:mm");

  const handleEditClick = () => {
    console.log("Edit operation:", operation);
    setIsEditDialogOpen(true);
  };

  const handleEditConfirm = (updatedOperation: Operation) => {
    onEdit(updatedOperation);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'opération #{operation.id}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-medium">Type:</div>
              <div className="capitalize">
                {operation.type === "deposit" && "Versement"}
                {operation.type === "withdrawal" && "Retrait"}
                {operation.type === "transfer" && "Virement"}
              </div>
              
              <div className="font-medium">Date:</div>
              <div>{formattedDate}</div>
              
              <div className="font-medium">Montant:</div>
              <div>
                {operation.type === "withdrawal" ? "-" : 
                 operation.type === "deposit" ? "+" : ""}
                {formatNumber(operation.amount)} TND
              </div>
              
              <div className="font-medium">Description:</div>
              <div>{operation.description}</div>
              
              {operation.type === "transfer" ? (
                <>
                  <div className="font-medium">De:</div>
                  <div>{operation.fromClient}</div>
                  <div className="font-medium">À:</div>
                  <div>{operation.toClient}</div>
                </>
              ) : (
                <>
                  <div className="font-medium">Client:</div>
                  <div>{operation.fromClient}</div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              onClick={handleEditClick}
            >
              <Edit2 className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
              onClick={() => onDelete(operation)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditOperationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        operation={operation}
        onConfirm={handleEditConfirm}
      />
    </>
  );
};
