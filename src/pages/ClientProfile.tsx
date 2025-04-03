
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientPersonalInfo } from "@/features/clients/components/ClientPersonalInfo";
import { ClientOperationsHistory } from "@/features/clients/components/ClientOperationsHistory";
import { OperationsDetailCards } from "@/features/clients/components/OperationsDetailCards";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ClientProfile = () => {
  const {
    client,
    clientId,
    clientOperations,
    filteredOperations,
    isLoading,
    error,
    navigate,
    qrCodeRef,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    showAllDates,
    setShowAllDates,
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    refreshClientOperations,
    clientBalance
  } = useClientProfile();

  // Track if we've shown the initial loading state
  const [initialLoadingShown, setInitialLoadingShown] = useState(true);
  // Track if we're in a loading timeout state
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    console.log(`ClientProfile - Paramètres de la route: clientId=${clientId}, chemin=${window.location.pathname}`);
    
    if (error) {
      console.error("ClientProfile - Erreur détectée:", error);
      toast.error("Erreur de chargement", {
        description: error
      });
    }
    
    // Set a timeout for long-running loading states
    let timer: NodeJS.Timeout | null = null;
    if (isLoading && initialLoadingShown) {
      timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // Show timeout message after 10 seconds
    } else {
      setInitialLoadingShown(false);
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [clientId, error, isLoading, initialLoadingShown]);

  useEffect(() => {
    if (client && clientOperations?.length === 0) {
      console.log("Client chargé mais aucune opération trouvée. Cela pourrait indiquer un problème de récupération de données.");
      
      const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : null;
      console.log(`Nom complet du client utilisé pour le filtrage des opérations: "${clientFullName}"`);
    }
  }, [client, clientOperations]);

  // Listen for operation updates from real-time subscriptions
  useEffect(() => {
    const handleOperationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const updateClientId = customEvent.detail?.clientId;
      
      // Only refresh if this client is affected
      if (updateClientId === clientId || !updateClientId) {
        console.log("Auto-refreshing operations after update detection");
        refreshClientOperations();
      }
    };
    
    window.addEventListener('operations-update', handleOperationUpdate);
    
    return () => {
      window.removeEventListener('operations-update', handleOperationUpdate);
    };
  }, [clientId, refreshClientOperations]);

  console.log("ClientProfile - État complet:", { 
    client, 
    isLoading, 
    error, 
    clientId,
    hasOperations: clientOperations?.length > 0,
    filteredOpsCount: filteredOperations?.length,
    clientName: client ? `${client.prenom} ${client.nom}` : null,
    currentPath: window.location.pathname,
    currentBalance: clientBalance
  });

  // Extended loading state with retry option for timeouts
  if (isLoading && initialLoadingShown) {
    return (
      <PublicClientLoading 
        onRetry={refetchClient} 
        timeout={loadingTimeout}
        timeoutMessage="Le chargement prend plus de temps que prévu. Vous pouvez réessayer ou revenir plus tard."
      />
    );
  }

  if (error) {
    console.log("Affichage de l'erreur:", error);
    return <PublicClientError error={error} onRetry={refetchClient} />;
  }

  if (!client) {
    console.log("Client non trouvé pour l'ID:", clientId);
    const errorMessage = `Le client avec l'identifiant ${clientId} n'existe pas ou a été supprimé.`;
    return <PublicClientError error={errorMessage} onRetry={refetchClient} />;
  }

  const actualClientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;
  console.log("Utilisation de l'ID client pour le code QR:", actualClientId);

  // Updated handleTypeChange to ensure we only pass valid union types
  const handleTypeChange = (type: string) => {
    // Validate that the type is one of the allowed values before setting
    if (type === "deposit" || type === "withdrawal" || type === "transfer" || type === "all") {
      setSelectedType(type as "deposit" | "withdrawal" | "transfer" | "all");
    } else {
      console.error(`Invalid operation type: ${type}`);
      // Default to "all" if an invalid type is provided
      setSelectedType("all");
    }
  };

  return (
    <div className="sm:container mx-auto px-0 sm:px-4 py-4 sm:py-8 max-w-7xl overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 w-full px-2 sm:px-0">
        <div>
          <Button variant="ghost" onClick={() => navigate('/clients')} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour aux clients
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Profil Client</h1>
          <p className="text-muted-foreground">
            Détails et historique des opérations
          </p>
        </div>

        <ClientPersonalInfo 
          client={client} 
          clientId={typeof client?.id === 'string' ? parseInt(client.id, 10) : client?.id}
          qrCodeRef={qrCodeRef}
          formatAmount={formatAmount}
          refetchClient={refetchClient}
          refreshClientBalance={refreshClientBalance}
          clientBalance={clientBalance}
        />

        <ClientOperationsHistory
          operations={clientOperations}
          selectedType={selectedType}
          setSelectedType={handleTypeChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isCustomRange={isCustomRange}
          setIsCustomRange={setIsCustomRange}
          filteredOperations={filteredOperations}
          refreshOperations={refreshClientOperations}
          showAllDates={showAllDates}
          setShowAllDates={setShowAllDates}
        />

        <OperationsDetailCards
          clientOperations={clientOperations}
          formatAmount={formatAmount}
        />
      </div>
    </div>
  );
};

export default ClientProfile;
