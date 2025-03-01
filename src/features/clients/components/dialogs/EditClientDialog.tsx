
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { Client } from "../../types";
import { formatPhoneNumber } from "./utils";

type EditClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
};

interface EditClientDialogProps {
  isOpen: boolean;
  selectedClient: Client | null;
  editForm: EditClientForm;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (form: EditClientForm) => void;
}

export const EditClientDialog = ({
  isOpen,
  selectedClient,
  editForm,
  onClose,
  onSubmit,
  onChange,
}: EditClientDialogProps) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    onChange({ ...editForm, telephone: formattedNumber });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
              <Pencil className="h-5 w-5" />
            </div>
            Modifier le client
          </DialogTitle>
          <DialogDescription className="text-base">
            Modifiez les informations de {selectedClient?.prenom} {selectedClient?.nom}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nom">Nom</Label>
            <Input
              id="edit-nom"
              value={editForm.nom}
              onChange={(e) => onChange({ ...editForm, nom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prenom">Prénom</Label>
            <Input
              id="edit-prenom"
              value={editForm.prenom}
              onChange={(e) => onChange({ ...editForm, prenom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-telephone">Téléphone</Label>
            <Input
              id="edit-telephone"
              value={editForm.telephone}
              onChange={handlePhoneChange}
              placeholder="XX XXX XXX"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(e) => onChange({ ...editForm, email: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
