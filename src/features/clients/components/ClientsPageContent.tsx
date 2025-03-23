
import { Client } from "@/features/clients/types";
import { ClientList } from "./ClientList";
import { ClientInsights } from "./ClientInsights";
import { ClientSearch } from "./ClientSearch";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISuggestion } from "../types";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface ClientsPageContentProps {
  clients: Client[];
  filteredClients: Client[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleEdit: (client: Client) => void;
  handleDelete: (client: Client) => void;
  handleRetry: () => void;
  openNewClientDialog: () => void;
}

export const ClientsPageContent = ({
  clients,
  filteredClients,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  handleEdit,
  handleDelete,
  handleRetry,
  openNewClientDialog
}: ClientsPageContentProps) => {
  // Fixed the type issue by explicitly setting the type properties to valid values
  const aiSuggestions: AISuggestion[] = [{
    id: "1",
    message: "Nouveau client potentiel détecté",
    type: "success",
    // Changed from string to specific union type value
    clientId: "1"
  }, {
    id: "2",
    message: "Mise à jour des informations recommandée",
    type: "info",
    // Changed from string to specific union type value
    clientId: "3"
  }];

  // Render content based on loading state and errors
  const renderContent = () => {
    if (loading && clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LoadingIndicator size="lg" text="Chargement des clients..." />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Erreur de connexion</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      );
    }
    
    if (clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <p className="text-muted-foreground">Aucun client trouvé.</p>
          <Button onClick={openNewClientDialog} variant="default">
            Ajouter un client
          </Button>
        </div>
      );
    }
    
    return (
      <div className={loading ? "opacity-70 pointer-events-none" : ""}>
        <ClientList clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2">
            <LoadingIndicator size="sm" />
            <span>Actualisation...</span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6 animate-in px-2 sm:px-4 md:px-6 max-w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Gestion des clients</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez vos clients avec l'aide de l'intelligence artificielle
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <ClientInsights suggestions={aiSuggestions} />
        <ClientSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} onNewClient={openNewClientDialog} />
      </div>

      {renderContent()}
    </div>
  );
};
