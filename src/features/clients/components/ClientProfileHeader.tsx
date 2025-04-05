
import { UserCircle, Wallet, Phone, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientIdBadge } from "./ClientIdBadge";
import { ClientQRCode } from "./ClientQRCode";
import { Client } from "../types";

interface ClientProfileHeaderProps {
  client: Client;
  clientId: number;
  clientBalance: number | null;
  isLoading: boolean;
  formatAmount: (amount: number) => string;
  refreshClientBalance: () => void;
  navigateToClients: () => void;
  error?: string | null;
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <Card className="w-full max-w-md p-6 text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <UserCircle className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-medium">Chargement du profil client...</p>
            <p className="text-muted-foreground mt-2">Veuillez patienter pendant que nous récupérons les informations</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client || error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">
          Erreur lors du chargement du profil client
        </h1>
        <p className="mt-2">{error || "Client introuvable"}</p>
        <button
          onClick={navigateToClients}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Retour à la liste des clients
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col gap-4 lg:w-2/3">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {client.prenom} {client.nom}
                <ClientIdBadge clientId={client.id} />
              </h1>
              <p className="text-muted-foreground">
                Client depuis{" "}
                {new Date(client.date_creation).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg shadow-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="font-medium">{client.telephone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg shadow-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium overflow-hidden text-ellipsis">
                  {client.email || "Non renseigné"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-sm mt-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Solde actuel</p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-xl ${(clientBalance || client.solde) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(clientBalance !== null ? clientBalance : client.solde)}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshClientBalance} 
                    className="gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Actualiser
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <Button 
              onClick={() => document.getElementById('depositDialog')?.click()} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 gap-2" 
            >
              Versement
            </Button>
            <Button 
              onClick={() => document.getElementById('withdrawalDialog')?.click()} 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              Retrait
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('exportExcel')?.click()}
              className="gap-2"
            >
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('exportPDF')?.click()}
              className="gap-2"
            >
              PDF
            </Button>
          </div>
        </div>
        
        <div className="lg:w-1/3 flex justify-center items-start">
          <div className="w-full max-w-[220px]">
            <ClientQRCode 
              clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
              clientName={`${client.prenom} ${client.nom}`} 
              size={200} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
