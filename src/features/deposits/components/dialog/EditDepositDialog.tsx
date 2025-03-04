
import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";
import { NotesField } from "@/features/withdrawals/components/form-fields/NotesField";
import { AmountField } from "@/features/withdrawals/components/form-fields/AmountField";
import { EditFormData } from "@/components/deposits/types";

export interface EditDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const EditDepositDialog: React.FC<EditDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  editForm,
  onEditFormChange,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <div className="rounded-xl bg-blue-100 dark:bg-blue-900/20 p-2">
            <ArrowUpCircle className="h-6 w-6 text-blue-600" />
          </div>
          Modifier le versement
        </DialogTitle>
        <DialogDescription className="text-base">
          Modifiez les informations du versement
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/50 p-6">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative grid gap-4">
            <div className="space-y-2">
              <label htmlFor="clientName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Client
              </label>
              <input
                id="clientName"
                value={editForm.clientName}
                onChange={(e) => onEditFormChange('clientName', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                readOnly
              />
            </div>

            <AmountField
              value={editForm.amount}
              onChange={(value) => onEditFormChange('amount', value)}
              id="edit-amount"
            />

            <NotesField
              value={editForm.notes}
              onChange={(value) => onEditFormChange('notes', value)}
              id="edit-notes"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="gap-2">
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-[200px]"
          disabled={isLoading}
        >
          <ArrowUpCircle className="h-4 w-4" />
          {isLoading ? "En cours..." : "Modifier le versement"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
