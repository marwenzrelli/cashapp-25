
import { Button } from "@/components/ui/button";
import { ChevronLeft, Smartphone, Download, RefreshCw, Monitor } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Client } from "../types";
import { ClientIdBadge } from "./ClientIdBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ClientProfileHeaderProps {
  client: Client | null;
  clientId: number | null;
  clientBalance: number | null;
  isLoading: boolean;
  error: Error | null;
  formatAmount: (amount: number) => string;
  refreshClientBalance: () => Promise<void>;
  navigateToClients: () => void;
}

export const ClientProfileHeader = ({
  client,
  clientId,
  clientBalance,
  isLoading,
  error,
  formatAmount,
  refreshClientBalance,
  navigateToClients
}: ClientProfileHeaderProps) => {
  // Generate formatted balance for display
  const formattedBalance = clientBalance !== null && !isLoading && !error 
    ? formatAmount(clientBalance)
    : '...';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={navigateToClients}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div>
          <h1 className="text-xl font-bold flex items-center">
            {isLoading ? (
              <LoadingIndicator className="mr-2" size="sm" />
            ) : error ? (
              "Erreur"
            ) : (
              <>
                {client ? `${client.prenom} ${client.nom}` : "Client"} 
                {clientId && (
                  <ClientIdBadge clientId={clientId} />
                )}
              </>
            )}
          </h1>
          
          <p className="text-sm text-muted-foreground hidden sm:block">
            Profil et historique des opérations
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:flex-row">
        <Button 
          variant="outline"
          size="sm"
          onClick={refreshClientBalance}
          disabled={isLoading}
          className="mr-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isLoading ? "..." : formattedBalance}
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => document.getElementById('exportPDF')?.click()}
        >
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => document.getElementById('exportExcel')?.click()}
        >
          <Download className="h-4 w-4 mr-2" />
          Excel
        </Button>
      </div>
    </div>
  );
};
