
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, User, Phone, Mail } from "lucide-react";
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
          {/* Name fields with icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prenom" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Prénom
              </Label>
              <Input
                id="edit-prenom"
                value={editForm.prenom}
                onChange={(e) => onChange({ ...editForm, prenom: e.target.value })}
                className="focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nom" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nom
              </Label>
              <Input
                id="edit-nom"
                value={editForm.nom}
                onChange={(e) => onChange({ ...editForm, nom: e.target.value })}
                className="focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Contact information */}
          <div className="space-y-2">
            <Label htmlFor="edit-telephone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Téléphone
            </Label>
            <Input
              id="edit-telephone"
              value={editForm.telephone}
              onChange={handlePhoneChange}
              placeholder="XX XXX XXX"
              maxLength={10}
              className="focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(e) => onChange({ ...editForm, email: e.target.value })}
              className="focus:border-blue-500 focus:ring-blue-500"
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
