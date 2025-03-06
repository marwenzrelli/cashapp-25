
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientPersonalInfo } from "@/features/clients/components/ClientPersonalInfo";
import { ClientOperationsHistory } from "@/features/clients/components/ClientOperationsHistory";
import { OperationsDetailCards } from "@/features/clients/components/OperationsDetailCards";
import { PublicClientError } from "@/features/clients/components/PublicClientError";

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
    exportToPDF
  } = useClientProfile();

  console.log("ClientProfile - État complet:", { 
    client, 
    isLoading, 
    error, 
    clientId,
    hasOperations: clientOperations?.length > 0,
    filteredOpsCount: filteredOperations?.length 
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check for error first
  if (error) {
    console.log("Affichage de l'erreur:", error);
    return <PublicClientError error={error} />;
  }

  // Then check if client exists
  if (!client) {
    const errorMessage = `Le client avec l'identifiant ${clientId} n'existe pas ou a été supprimé.`;
    console.log("Client non trouvé:", errorMessage);
    return <PublicClientError error={errorMessage} />;
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
