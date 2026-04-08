
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, RotateCw } from "lucide-react";
import { recalculateAllClientBalances } from "@/features/statistics/utils/balanceCalculator";
import { toast } from "sonner";

interface AdminHeaderProps {
  onAddUser: () => void;
}

export const AdminHeader = ({ onAddUser }: AdminHeaderProps) => {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      toast.info("Recalcul des soldes clients en cours...");
      const success = await recalculateAllClientBalances();
      if (success) {
        toast.success("Soldes clients recalculés avec succès");
      } else {
        toast.error("Erreur lors du recalcul des soldes");
      }
    } catch {
      toast.error("Erreur lors du recalcul des soldes");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Gestion des utilisateurs et des autorisations
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="flex items-center gap-2"
        >
          <RotateCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalcul...' : 'Recalculer les soldes'}
        </Button>
        <Button
          onClick={onAddUser}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>
    </div>
  );
};
