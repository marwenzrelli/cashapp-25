
import { type Transfer, type EditFormData } from "../types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditTransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  editForm: EditFormData;
  onEditFormChange: (form: EditFormData) => void;
  onConfirm: () => void;
}

export const EditTransferDialog = ({
  isOpen,
  onOpenChange,
  transfer,
  editForm,
  onEditFormChange,
  onConfirm,
}: EditTransferDialogProps) => {
  if (!transfer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le virement</DialogTitle>
          <DialogDescription>
            Modifiez les informations du virement ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Compte émetteur</Label>
            <Select
              value={editForm.fromClient}
              onValueChange={(value) =>
                onEditFormChange({ ...editForm, fromClient: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={transfer.fromClient}>{transfer.fromClient}</SelectItem>
                <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Compte bénéficiaire</Label>
            <Select
              value={editForm.toClient}
              onValueChange={(value) =>
                onEditFormChange({ ...editForm, toClient: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={transfer.toClient}>{transfer.toClient}</SelectItem>
                <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Montant</Label>
            <Input
              type="number"
              defaultValue={transfer.amount}
              value={editForm.amount}
              onChange={(e) =>
                onEditFormChange({ ...editForm, amount: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Motif</Label>
            <Input
              defaultValue={transfer.reason}
              value={editForm.reason}
              onChange={(e) =>
                onEditFormChange({ ...editForm, reason: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
