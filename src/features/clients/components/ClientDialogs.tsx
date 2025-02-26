import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus, User, Mail, Phone, Coins, Pencil, Trash2 } from "lucide-react";
import { Client } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";

type NewClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
};

type EditClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
};

interface ClientDialogsProps {
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  selectedClient: Client | null;
  newClient: NewClientForm;
  editForm: EditClientForm;
  onCreateClose: () => void;
  onEditClose: () => void;
  onDeleteClose: () => void;
  onCreateSubmit: () => void;
  onEditSubmit: () => void;
  onDeleteSubmit: () => void;
  onNewClientChange: (client: NewClientForm) => void;
  onEditFormChange: (form: EditClientForm) => void;
}

export const ClientDialogs = ({
  isCreateOpen,
  isEditOpen,
  isDeleteOpen,
  selectedClient,
  newClient,
  editForm,
  onCreateClose,
  onEditClose,
  onDeleteClose,
  onCreateSubmit,
  onEditSubmit,
  onDeleteSubmit,
  onNewClientChange,
  onEditFormChange,
}: ClientDialogsProps) => {
  const { currency } = useCurrency();

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={onCreateClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="rounded-xl bg-primary/10 p-2">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              Nouveau client
            </DialogTitle>
            <DialogDescription className="text-base">
              Créez un nouveau compte client en remplissant le formulaire ci-dessous
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-muted/50 to-muted p-6">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="relative grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="prenom"
                        placeholder="Jean"
                        value={newClient.prenom}
                        onChange={(e) => onNewClientChange({ ...newClient, prenom: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nom"
                        placeholder="Dupont"
                        value={newClient.nom}
                        onChange={(e) => onNewClientChange({ ...newClient, nom: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@example.com"
                      value={newClient.email}
                      onChange={(e) => onNewClientChange({ ...newClient, email: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telephone"
                        placeholder="06 12 34 56 78"
                        value={newClient.telephone}
                        onChange={(e) => onNewClientChange({ ...newClient, telephone: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solde">Solde initial</Label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="solde"
                        type="number"
                        placeholder="0.00"
                        value={newClient.solde}
                        onChange={(e) => onNewClientChange({ ...newClient, solde: parseFloat(e.target.value) })}
                        className="pl-9"
                      />
                      <span className="absolute right-3 top-3 text-muted-foreground">{currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onCreateClose}>
              Annuler
            </Button>
            <Button onClick={onCreateSubmit} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={onEditClose}>
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
                onChange={(e) => onEditFormChange({ ...editForm, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prenom">Prénom</Label>
              <Input
                id="edit-prenom"
                value={editForm.prenom}
                onChange={(e) => onEditFormChange({ ...editForm, prenom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telephone">Téléphone</Label>
              <Input
                id="edit-telephone"
                value={editForm.telephone}
                onChange={(e) => onEditFormChange({ ...editForm, telephone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => onEditFormChange({ ...editForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onEditClose}>
              Annuler
            </Button>
            <Button onClick={onEditSubmit} className="bg-blue-600 hover:bg-blue-700">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={onDeleteClose}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
              {selectedClient && (
                <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                  {selectedClient.prenom} {selectedClient.nom}
                </div>
              )}
              <p className="text-destructive font-medium">Cette action est irréversible.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteSubmit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
