
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus, User, Mail, Phone, Coins } from "lucide-react";
import { formatPhoneNumber, useFormattedCurrency } from "./utils";

type NewClientForm = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
};

interface CreateClientDialogProps {
  isOpen: boolean;
  newClient: NewClientForm;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (client: NewClientForm) => void;
}

export const CreateClientDialog = ({
  isOpen,
  newClient,
  onClose,
  onSubmit,
  onChange,
}: CreateClientDialogProps) => {
  const currency = useFormattedCurrency();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    onChange({ ...newClient, telephone: formattedNumber });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                      placeholder="Mohamed"
                      value={newClient.prenom}
                      onChange={(e) => onChange({ ...newClient, prenom: e.target.value })}
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
                      placeholder="Ben Ali"
                      value={newClient.nom}
                      onChange={(e) => onChange({ ...newClient, nom: e.target.value })}
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
                    placeholder="mohamed.benali@example.com"
                    value={newClient.email}
                    onChange={(e) => onChange({ ...newClient, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telephone"
                      placeholder="XX XXX XXX"
                      value={newClient.telephone}
                      onChange={handlePhoneChange}
                      className="pl-9"
                      maxLength={10}
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
                      onChange={(e) => onChange({ ...newClient, solde: parseFloat(e.target.value) })}
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
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSubmit} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer le compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
