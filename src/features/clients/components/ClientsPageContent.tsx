
import { Client } from "@/features/clients/types";
import { ClientList } from "./ClientList";
import { ClientInsights } from "./ClientInsights";
import { ClientSearch } from "./ClientSearch";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISuggestion } from "../types";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useRef, useEffect, useState } from "react";

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
    clientId: "1"
  }, {
    id: "2",
    message: "Mise à jour des informations recommandée",
    type: "info",
    clientId: "3"
  }];

  const [contentReady, setContentReady] = useState(false);
  const [initialContentShown, setInitialContentShown] = useState(false);

  // Effect pour transition de contenu
  useEffect(() => {
    // Montrer le contenu plus rapidement
    requestAnimationFrame(() => {
      setContentReady(true);
    });
    
    const timer = setTimeout(() => {
      setInitialContentShown(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Render content based on loading state and errors
  const renderContent = () => {    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
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
        <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-200">
          <p className="text-muted-foreground">Aucun client trouvé.</p>
          <Button onClick={openNewClientDialog} variant="default">
            Ajouter un client
          </Button>
        </div>
      );
    }
    
    return (
      <div className="relative">
        {loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-primary/10 backdrop-blur-sm rounded-full px-4 py-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-5 duration-200">
              <LoadingIndicator size="sm" fadeIn={false} showImmediately />
              <span className="text-sm text-primary">Actualisation...</span>
            </div>
          </div>
        )}
        <ClientList clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    );
  };
  
  return (
    <div className={`space-y-6 px-2 sm:px-4 md:px-6 max-w-full transition-all duration-300 ${contentReady ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Gestion des clients</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez vos clients avec l'aide de l'intelligence artificielle
        </p>
      </div>

      <div className={`grid gap-4 md:gap-6 md:grid-cols-2 transition-opacity duration-300 ${initialContentShown ? 'opacity-100' : 'opacity-0'}`}>
        <ClientInsights suggestions={aiSuggestions} />
        <ClientSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} onNewClient={openNewClientDialog} />
      </div>

      {renderContent()}
    </div>
  );
};
