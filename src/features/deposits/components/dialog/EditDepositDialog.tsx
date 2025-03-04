
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar, Clock, User, DollarSign, ScrollText } from "lucide-react";
import { NotesField } from "@/features/withdrawals/components/form-fields/NotesField";
import { AmountField } from "@/features/withdrawals/components/form-fields/AmountField";
import { DateField } from "@/features/withdrawals/components/form-fields/DateField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditFormData } from "@/components/deposits/types";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface EditDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  selectedDeposit?: any;
}

export const EditDepositDialog: React.FC<EditDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  editForm,
  onEditFormChange,
  onConfirm,
  isLoading = false,
  selectedDeposit
}) => {
  const { currency } = useCurrency();

  // Effect to format date from operation_date if it exists
  useEffect(() => {
    if (selectedDeposit?.operation_date) {
      const operationDate = new Date(selectedDeposit.operation_date);
      const formattedDate = operationDate.toISOString().split('T')[0];
      const formattedTime = operationDate.toTimeString().slice(0, 8);
      
      if (!editForm.date) {
        onEditFormChange('date', formattedDate);
      }
      
      if (!editForm.time) {
        onEditFormChange('time', formattedTime);
      }
    }
  }, [selectedDeposit, editForm.date, editForm.time, onEditFormChange]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/20 p-2">
              <Pencil className="h-6 w-6 text-blue-600" />
            </div>
            Modifier le versement
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Modifiez les informations du versement
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Date and Time */}
          <div className="space-y-2">
            <Label htmlFor="depositDate" className="text-base font-medium">Date et heure du versement</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="depositDate"
                  type="date"
                  className="pl-10 border rounded-lg bg-gray-50"
                  value={editForm.date || ""}
                  onChange={(e) => onEditFormChange('date', e.target.value)}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  id="depositTime"
                  type="time"
                  step="1"
                  className="pl-10 border rounded-lg bg-gray-50"
                  value={editForm.time || ""}
                  onChange={(e) => onEditFormChange('time', e.target.value)}
                />
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-base font-medium">Client</Label>
            <div className="relative">
              <Input
                id="clientName"
                value={editForm.clientName}
                onChange={(e) => onEditFormChange('clientName', e.target.value)}
                className="pl-10 border rounded-lg bg-gray-50"
                readOnly
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            </div>
            {editForm.clientBalance && (
              <p className="text-sm text-red-500">{editForm.clientBalance} {currency}</p>
            )}
          </div>
          
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-base font-medium">Montant</Label>
            <div className="relative">
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) => onEditFormChange('amount', e.target.value)}
                className="pl-10 border rounded-lg bg-gray-50"
              />
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base font-medium">Description</Label>
            <div className="relative">
              <textarea
                id="edit-notes"
                placeholder="Description du versement..."
                value={editForm.notes || ""}
                onChange={(e) => onEditFormChange('notes', e.target.value)}
                className="w-full min-h-[100px] pl-10 pt-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ScrollText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        <hr className="mt-6" />

        <DialogFooter className="mt-4 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-base">
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-2 rounded-full text-base"
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4" />
            {isLoading ? "En cours..." : "Modifier le versement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
