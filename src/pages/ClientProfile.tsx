
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientPersonalInfo } from "@/features/clients/components/ClientPersonalInfo";
import { ClientOperationsHistory } from "@/features/clients/components/ClientOperationsHistory";
import { OperationsDetailCards } from "@/features/clients/components/OperationsDetailCards";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { useEffect } from "react";
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
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient
  } = useClientProfile();

  // Add additional debug logging
  useEffect(() => {
    console.log(`ClientProfile - Route parameters: clientId=${clientId}, path=${window.location.pathname}`);
    
    if (error) {
      console.error("ClientProfile - Error detected:", error);
      toast.error("Erreur de chargement", {
        description: error
      });
    }
  }, [clientId, error]);

  console.log("ClientProfile - Full state:", { 
    client, 
    isLoading, 
    error, 
    clientId,
    hasOperations: clientOperations?.length > 0,
    filteredOpsCount: filteredOperations?.length,
    clientName: client ? `${client.prenom} ${client.nom}` : null,
    currentPath: window.location.pathname
  });

  if (isLoading) {
    return <PublicClientLoading onRetry={refetchClient} />;
  }

  // Check if there's an explicit error first
  if (error) {
    console.log("Displaying error:", error);
    return <PublicClientError error={error} onRetry={refetchClient} />;
  }

  // Then check if client exists
  if (!client) {
    console.log("Client not found for ID:", clientId);
    const errorMessage = `Le client avec l'identifiant ${clientId} n'existe pas ou a été supprimé.`;
    return <PublicClientError error={errorMessage} onRetry={refetchClient} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/clients')} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour aux clients
          </Button>
          <h1 className="text-3xl font-bold">Profil Client</h1>
          <p className="text-muted-foreground">
            Détails et historique des opérations
          </p>
        </div>

        <ClientPersonalInfo 
          client={client} 
          clientId={clientId}
          qrCodeRef={qrCodeRef}
          formatAmount={formatAmount}
        />

        <ClientOperationsHistory
          operations={clientOperations}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isCustomRange={isCustomRange}
          setIsCustomRange={setIsCustomRange}
          filteredOperations={filteredOperations}
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
