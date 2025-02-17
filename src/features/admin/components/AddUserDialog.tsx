
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SystemUser, UserRole } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: SystemUser) => void;
}

export const AddUserDialog = ({ isOpen, onClose, onAddUser }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "cashier" as UserRole,
  });

  // Vérification du rôle de l'utilisateur actuel
  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Vous devez être connecté pour créer un utilisateur");
      onClose();
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'supervisor') {
      toast.error("Seul le superviseur peut créer des utilisateurs");
      onClose();
      return false;
    }

    return true;
  };

  const getDepartmentByRole = (role: UserRole): string => {
    switch (role) {
      case "supervisor":
        return "finance";
      case "manager":
        return "operations";
      case "cashier":
        return "accounting";
      default:
        return "accounting";
    }
  };

  const handleSubmit = async () => {
    // Vérifier d'abord si l'utilisateur est autorisé
    const isAuthorized = await checkUserRole();
    if (!isAuthorized) return;

    if (!newUser.fullName || !newUser.username || !newUser.password || !newUser.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation du nom d'utilisateur (pas d'espaces, caractères spéciaux limités)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(newUser.username)) {
      toast.error("Le nom d'utilisateur doit contenir entre 3 et 20 caractères et ne peut contenir que des lettres, chiffres, tirets et underscores");
      return;
    }

    // Validation du mot de passe (au moins 8 caractères)
    if (newUser.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    const user: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      department: getDepartmentByRole(newUser.role),
      status: "active",
      permissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    onAddUser(user);
    setNewUser({
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "cashier",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>
            Créez un nouvel utilisateur du système avec son nom d'utilisateur et mot de passe
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="fullName">Nom complet</label>
            <Input
              id="fullName"
              value={newUser.fullName}
              onChange={(e) =>
                setNewUser({ ...newUser, fullName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="username">Nom d'utilisateur</label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              placeholder="Exemple: jean_dupont"
            />
            <p className="text-sm text-muted-foreground">
              Lettres, chiffres, tirets et underscores uniquement (3-20 caractères)
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              placeholder="exemple@domaine.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Mot de passe</label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div className="space-y-2">
            <label>Rôle</label>
            <Select
              value={newUser.role}
              onValueChange={(value: UserRole) =>
                setNewUser({ ...newUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Superviseur (Finance)</SelectItem>
                <SelectItem value="manager">Gestionnaire (Opérations)</SelectItem>
                <SelectItem value="cashier">Caissier (Comptabilité)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Créer l'utilisateur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
