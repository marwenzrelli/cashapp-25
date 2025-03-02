
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface DashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const DashboardHeader = ({ isLoading, onRefresh }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble et analyses en temps réel
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
    </div>
  );
};
