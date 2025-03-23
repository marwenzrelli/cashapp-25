
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

  // Gestion de l'affichage de l'indicateur de chargement
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastShowTime = useRef<number>(0);

  // Effect pour transition de contenu
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Afficher l'indicateur de chargement seulement après un délai pour éviter le clignotement
  // Et ne pas afficher les indicateurs si le dernier a été affiché il y a moins de 3 secondes
  useEffect(() => {
    if (loading) {
      const now = Date.now();
      // Seulement montrer l'indicateur si le dernier indicateur a été affiché il y a plus de 3 secondes
      if (now - lastShowTime.current > 3000) {
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
        
        loadingTimerRef.current = setTimeout(() => {
          setShowLoadingIndicator(true);
          lastShowTime.current = Date.now();
          loadingTimerRef.current = null;
        }, 800); // 800ms delay before showing loading indicator (increased from 500ms)
      }
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      // Ajouter un léger délai avant de cacher l'indicateur pour une transition plus douce
      setTimeout(() => {
        setShowLoadingIndicator(false);
      }, 300);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [loading]);

  // Render content based on loading state and errors
  const renderContent = () => {
    if (loading && clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-500">
          <LoadingIndicator size="lg" text="Chargement des clients..." fadeIn={true} />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-300">
          <p className="text-muted-foreground">Aucun client trouvé.</p>
          <Button onClick={openNewClientDialog} variant="default">
            Ajouter un client
          </Button>
        </div>
      );
    }
    
    return (
      <div className={`transition-opacity duration-300 ${loading ? "opacity-70 pointer-events-none" : "opacity-100"}`}>
        <ClientList clients={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
        {showLoadingIndicator && loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300">
            <LoadingIndicator size="sm" fadeIn={false} />
            <span>Actualisation...</span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`space-y-6 px-2 sm:px-4 md:px-6 max-w-full transition-all duration-500 ${contentReady ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
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
