
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Client } from "../types";
import { ClientSkeleton } from "./skeletons/ClientSkeleton";
import { ErrorState } from "@/components/ErrorState";

interface ClientProfileHeaderProps {
  client: Client | null;
  clientId: number | null;
  clientBalance: number | null;
  isLoading: boolean;
  formatAmount: (amount: number) => string;
  refreshClientBalance: () => Promise<void>;
  navigateToClients: () => void;
  error: Error | null;
}

export function ClientProfileHeader({
  client,
  clientId,
  clientBalance,
  isLoading,
  formatAmount,
  refreshClientBalance,
  navigateToClients,
  error
}: ClientProfileHeaderProps) {
  if (error) {
    return (
      <ErrorState
        title="Erreur de chargement du client"
        description="Impossible de charger les données du client. Veuillez réessayer."
        action={
          <Button onClick={navigateToClients}>
            Retour à la liste des clients
          </Button>
        }
      />
    );
  }

  if (isLoading || !client) {
    return <ClientSkeleton />;
  }

  // Calculate display balance
  const displayBalance = clientBalance !== null ? clientBalance : client.solde;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToClients} 
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Retour aux clients
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {client.prenom} {client.nom}
        </h1>
        <p className="text-lg text-muted-foreground">
          Solde: <span className="font-semibold">{formatAmount(displayBalance || 0)}</span>
        </p>
      </div>
      
      <Button
        onClick={refreshClientBalance}
        variant="outline"
        size="sm"
        data-testid="refresh-balance-btn"
      >
        <Loader2 className="mr-2 h-4 w-4" />
        Actualiser le solde
      </Button>
    </div>
  );
}
