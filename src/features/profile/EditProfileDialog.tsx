
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Building, Calendar, Badge } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SystemUser } from "@/types/admin";

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: {
    name: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    joinDate: string;
    employeeId: string;
  };
  onSubmit: (updatedUser: Partial<SystemUser>) => void;
}

export const EditProfileDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onSubmit
}: EditProfileDialogProps) => {
  const [formData, setFormData] = useState(currentUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName: formData.name,
      email: formData.email
    });
    toast.success("Profil mis à jour avec succès");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Éditer le profil professionnel</DialogTitle>
          <DialogDescription>
            Modifiez vos informations professionnelles ci-dessous
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-9"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-9"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone professionnel</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Service</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="department"
                value={formData.department}
                className="pl-9"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Poste</Label>
            <div className="relative">
              <Badge className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="role"
                value={formData.role}
                className="pl-9"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Identifiant employé</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="employeeId"
                value={formData.employeeId}
                className="pl-9"
                readOnly
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
