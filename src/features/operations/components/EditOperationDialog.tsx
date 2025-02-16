
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operation } from "../types";

interface EditOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onOperationChange: (operation: Operation) => void;
  onConfirm: () => void;
}

export const EditOperationDialog = ({
  open,
  onOpenChange,
  operation,
  onOperationChange,
  onConfirm,
}: EditOperationDialogProps) => {
  if (!operation) return null;

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
              value={operation.description}
              onChange={(e) => onOperationChange({
                ...operation,
                description: e.target.value
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              value={operation.amount}
              onChange={(e) => onOperationChange({
                ...operation,
                amount: parseFloat(e.target.value)
              })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
