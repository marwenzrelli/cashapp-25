
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { formatDateTime } from "../types";
import { formatAmount } from "@/utils/formatCurrency";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { useState } from "react";
import { toast } from "sonner";

interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation | null;
  onEdit: (updatedOperation: Operation) => Promise<void>;
  onDelete: (operation: Operation) => void;
}

export function OperationDetailsModal({
  isOpen,
  onClose,
  operation,
  onEdit,
  onDelete
}: OperationDetailsModalProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!operation) return null;

  const getOperationTypeIcon = () => {
    switch (operation.type) {
      case 'deposit':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getOperationTypeText = () => {
    switch (operation.type) {
      case 'deposit':
        return 'Versement';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Transfert';
      default:
        return 'Opération';
    }
  };

  const getColorClass = () => {
    switch (operation.type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  const displayDate = operation.operation_date || operation.date;

  const formattedAmount = operation.type === 'withdrawal' 
    ? `- ${formatAmount(operation.amount, 'TND')}`
    : formatAmount(operation.amount, 'TND');

  const handleEditClick = () => {
    setShowEditDialog(true);
  };

  const handleEditComplete = async (updatedOperation: Operation) => {
    try {
      setIsEditing(true);
      console.log("Editing operation:", updatedOperation);
      
      await onEdit(updatedOperation);
      
      toast.success("Opération modifiée avec succès");
      setShowEditDialog(false);
      onClose();
    } catch (error) {
      console.error("Edit failed:", error);
      toast.error("La modification a échoué", {
        description: typeof error === 'string' ? error : (error instanceof Error ? error.message : "Une erreur s'est produite")
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">{getOperationTypeIcon()}</span>
              <span>{getOperationTypeText()}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Montant</div>
              <div className={`font-semibold text-lg ${getColorClass()}`}>
                {formattedAmount}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Date</div>
              <div>{formatDateTime(displayDate)}</div>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="text-sm text-muted-foreground">
                {operation.type === 'transfer' ? 'De' : 'Client'}
              </div>
              <div className="text-right">{operation.fromClient}</div>
            </div>
            
            {operation.type === 'transfer' && operation.toClient && (
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">À</div>
                <div className="text-right">{operation.toClient}</div>
              </div>
            )}
            
            {operation.description && (
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="text-right max-w-[250px] break-words">{operation.description}</div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => onDelete(operation)}
              disabled={isEditing}
            >
              Supprimer
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEditClick}
              disabled={isEditing}
            >
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <EditOperationDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          operation={operation}
          onConfirm={handleEditComplete}
        />
      )}
    </>
  );
}
