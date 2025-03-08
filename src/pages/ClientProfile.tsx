
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
    refetchClient,
    refreshClientBalance,
    refreshClientOperations,
    clientBalance
  } = useClientProfile();

  useEffect(() => {
    console.log(`ClientProfile - Paramètres de la route: clientId=${clientId}, chemin=${window.location.pathname}`);
    
    if (error) {
      console.error("ClientProfile - Erreur détectée:", error);
      toast.error("Erreur de chargement", {
        description: error
      });
    }
  }, [clientId, error]);

  useEffect(() => {
    if (client && clientOperations?.length === 0) {
      console.log("Client chargé mais aucune opération trouvée. Cela pourrait indiquer un problème de récupération de données.");
      
      const clientFullName = client ? `${client.prenom} ${client.nom}` : null;
      console.log(`Nom complet du client utilisé pour le filtrage des opérations: "${clientFullName}"`);
    }
  }, [client, clientOperations]);

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

  if (isLoading) {
    return <PublicClientLoading onRetry={refetchClient} />;
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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 w-full">
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
          setSelectedType={setSelectedType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          isCustomRange={isCustomRange}
          setIsCustomRange={setIsCustomRange}
          filteredOperations={filteredOperations}
          refreshOperations={refreshClientOperations}
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
