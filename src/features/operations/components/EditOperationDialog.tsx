
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operation } from "../types";
import { useState } from "react";

interface EditOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onConfirm: (updatedOperation: Operation) => void;
}

export const EditOperationDialog = ({
  open,
  onOpenChange,
  operation,
  onConfirm,
}: EditOperationDialogProps) => {
  const [editedOperation, setEditedOperation] = useState<Operation | null>(operation);

  // Update local state when operation prop changes
  useState(() => {
    setEditedOperation(operation);
  });

  if (!editedOperation) return null;

  const handleChange = (field: keyof Operation, value: any) => {
    setEditedOperation(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleConfirm = () => {
    if (editedOperation) {
      onConfirm(editedOperation);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'opération</DialogTitle>
          <DialogDescription>
            Modifiez les détails de l'opération sélectionnée
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editedOperation.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              value={editedOperation.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm}>
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
