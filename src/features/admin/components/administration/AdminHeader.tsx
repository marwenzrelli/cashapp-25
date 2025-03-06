
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface AdminHeaderProps {
  onAddUser: () => void;
}

export const AdminHeader = ({ onAddUser }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Gestion des utilisateurs et des autorisations
        </p>
      </div>
      <Button
        onClick={onAddUser}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Ajouter un utilisateur
      </Button>
    </div>
  );
};
