
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientPersonalInfo } from "@/features/clients/components/ClientPersonalInfo";
import { ClientOperationsHistory } from "@/features/clients/components/ClientOperationsHistory";
import { OperationsDetailCards } from "@/features/clients/components/OperationsDetailCards";
import { toast } from "sonner";
import { useEffect } from "react";

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
    formatAmount,
    exportToExcel,
    exportToPDF
  } = useClientProfile();

  // Display toast on error
  useEffect(() => {
    if (error) {
      console.error("Error loading client profile:", error);
      toast.error("Erreur lors du chargement du profil client", {
        description: error,
      });
    }
  }, [error]);

  // Improved loading state with feedback
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold">Chargement du profil client...</h2>
        <p className="text-muted-foreground mt-2">Veuillez patienter</p>
      </div>
    );
  }

  // Enhanced error state with more details and actions
  if (error || !client || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm max-w-md w-full border border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-destructive">
              {error || "Client non trouvé"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {!client 
                ? "Impossible de trouver les informations de ce client. Vérifiez l'identifiant du client ou essayez à nouveau."
                : "Une erreur s'est produite lors du chargement des informations client."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
              <Button variant="default" onClick={() => navigate('/clients')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour à la liste des clients
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
