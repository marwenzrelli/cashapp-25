
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { type Deposit, type EditFormData } from "./types";

interface EditDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  onConfirm: () => void;
}

export const EditDepositDialog = ({
  isOpen,
  onOpenChange,
  selectedDeposit,
  editForm,
  onEditFormChange,
  onConfirm,
}: EditDepositDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
              <Pencil className="h-5 w-5" />
            </div>
            Modifier le versement #{selectedDeposit?.id.toString().padStart(6, '0')}
          </DialogTitle>
          <DialogDescription className="text-base">
            Modifiez les informations du versement effectué le {selectedDeposit?.date}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-clientName">Client</Label>
            <Input
              id="edit-clientName"
              value={editForm.clientName}
              onChange={(e) => onEditFormChange("clientName", e.target.value)}
              className="transition-all focus-visible:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Montant</Label>
            <Input
              id="edit-amount"
              type="number"
              min="0"
              step="0.01"
              value={editForm.amount}
              onChange={(e) => onEditFormChange("amount", e.target.value)}
              className="transition-all focus-visible:ring-blue-500"
              required
            />
            <p className="text-sm text-muted-foreground">
              Montant actuel : {selectedDeposit?.amount.toLocaleString()} TND
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Description</Label>
            <Input
              id="edit-notes"
              value={editForm.notes}
              onChange={(e) => onEditFormChange("notes", e.target.value)}
              className="transition-all focus-visible:ring-blue-500"
              placeholder={selectedDeposit?.description || "Ajouter une description"}
            />
          </div>
          <div className="mt-4 rounded-lg bg-muted p-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Statut :</strong> {selectedDeposit?.status}</p>
              <p><strong>Date de création :</strong> {new Date(selectedDeposit?.created_at || "").toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
