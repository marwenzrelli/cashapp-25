
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operation } from "../types";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, ScrollText } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatISODateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { toast } from "sonner";

interface EditOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onConfirm: (updatedOperation: Operation) => Promise<void>;
}

interface EditableOperation extends Omit<Operation, 'date'> {
  date: string;
  time: string;
}

export const EditOperationDialog = ({
  open,
  onOpenChange,
  operation,
  onConfirm,
}: EditOperationDialogProps) => {
  const { currency } = useCurrency();
  const [editedOperation, setEditedOperation] = useState<EditableOperation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && operation) {
      const dateTime = formatISODateTime(operation.operation_date || operation.date || "");
      
      setEditedOperation({
        ...operation,
        date: dateTime.date,
        time: dateTime.time
      });
    }
  }, [open, operation]);

  if (!editedOperation || !open) return null;

  const handleChange = (field: keyof EditableOperation, value: any) => {
    setEditedOperation(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleConfirm = async () => {
    if (!editedOperation) return;
    
    try {
      setIsSubmitting(true);
      
      if (!editedOperation.date || !editedOperation.time) {
        toast.error("Date et heure requises");
        return;
      }
      
      let timeValue = editedOperation.time;
      if (timeValue.split(':').length === 2) {
        timeValue = `${timeValue}:00`;
      }
      
      console.log("Saving operation with:", {
        date: editedOperation.date,
        time: timeValue,
        combinedDate: new Date(editedOperation.date + "T" + timeValue)
      });
      
      const combinedDate = new Date(editedOperation.date + "T" + timeValue);
      
      if (isNaN(combinedDate.getTime())) {
        toast.error("Date ou heure invalide");
        return;
      }
      
      const updatedOperation: Operation = {
        ...editedOperation,
        operation_date: combinedDate.toISOString()
      };
      
      await onConfirm(updatedOperation);
      toast.success("Opération modifiée avec succès");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving operation:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
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
                  value={editedOperation.time ? editedOperation.time.substring(0, 5) : ""}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Client</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                value={editedOperation.fromClient || ""}
                onChange={(e) => handleChange('fromClient', e.target.value)}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
