
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operation } from "../types";
import { useState } from "react";
import { Calendar, Clock, User, ScrollText } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatISODateTime } from "@/features/deposits/hooks/utils/dateUtils";

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
  const { currency } = useCurrency();
  const [editedOperation, setEditedOperation] = useState<Operation | null>(operation);

  // Update local state when operation prop changes
  useState(() => {
    if (operation) {
      // Format the date/time when initializing the form
      const { date, time } = formatISODateTime(operation.date || operation.operation_date || "");
      setEditedOperation({
        ...operation,
        date,
        time
      });
    }
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
      // Combine date and time before sending
      const combinedDate = new Date(editedOperation.date + "T" + editedOperation.time);
      const updatedOperation = {
        ...editedOperation,
        operation_date: combinedDate.toISOString()
      };
      
      onConfirm(updatedOperation);
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
          {/* Date and Time Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Date et heure d'opération</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={editedOperation.date || ""}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  step="1"
                  value={editedOperation.time || ""}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Client Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Client</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                value={editedOperation.fromClient || editedOperation.client_name || ""}
                onChange={(e) => handleChange(
                  editedOperation.type === 'transfer' ? 'fromClient' : 'client_name',
                  e.target.value
                )}
                className="pl-10"
              />
            </div>
            {editedOperation.type === 'transfer' && (
              <div className="relative mt-2">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  value={editedOperation.toClient || ""}
                  onChange={(e) => handleChange('toClient', e.target.value)}
                  className="pl-10"
                  placeholder="Client destinataire"
                />
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Montant</Label>
            <div className="relative">
              <Input
                type="number"
                value={editedOperation.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                className="pr-16"
              />
              <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                {currency}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Description</Label>
            <div className="relative">
              <ScrollText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                value={editedOperation.description || ""}
                onChange={(e) => handleChange('description', e.target.value)}
                className="pl-10"
                placeholder="Description de l'opération"
              />
            </div>
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
