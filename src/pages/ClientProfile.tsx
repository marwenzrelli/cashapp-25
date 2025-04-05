
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientPersonalInfo } from "@/features/clients/components/ClientPersonalInfo";
import { ClientBalanceCard } from "@/features/clients/components/ClientBalanceCard";
import { ClientOperationsHistory } from "@/features/clients/components/ClientOperationsHistory";
import { ClientInsights } from "@/features/clients/components/ClientInsights";
import { OperationsDetailCards } from "@/features/clients/components/OperationsDetailCards";
import { ClientIdBadge } from "@/features/clients/components/ClientIdBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientActionButtons } from "@/features/clients/components/ClientActionButtons";
import { ClientPublicPreview } from "@/features/clients/components/ClientPublicPreview";

export default function ClientProfile() {
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
    clientBalance,
    isPepsiMen
  } = useClientProfile();

  if (isLoading) {
    return <div className="p-8 flex justify-center">Chargement du profil client...</div>;
  }

  if (!client || error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">
          Erreur lors du chargement du profil client
        </h1>
        <p className="mt-2">{error || "Client introuvable"}</p>
        <button
          onClick={() => navigate("/clients")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Retour à la liste des clients
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-4">
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
        <ClientActionButtons
          refreshBalance={refreshClientBalance}
          exportToExcel={exportToExcel}
          exportToPDF={exportToPDF}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="space-y-6">
            <ClientPersonalInfo 
              client={client} 
              clientId={clientId}
              qrCodeRef={qrCodeRef}
              formatAmount={formatAmount}
              refetchClient={refetchClient}
              refreshClientBalance={refreshClientBalance}
              clientBalance={clientBalance}
            />
            <ClientBalanceCard
              client={client}
              clientId={clientId}
              exportToExcel={exportToExcel}
              exportToPDF={exportToPDF}
              formatAmount={formatAmount}
              showQRCode={false}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <Tabs defaultValue="operations" className="space-y-6">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="operations">Opérations</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="public-preview">Aperçu public</TabsTrigger>
            </TabsList>
            
            <TabsContent value="operations" className="space-y-6">
              <OperationsDetailCards 
                clientOperations={clientOperations}
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
                refreshOperations={refreshClientOperations}
                showAllDates={showAllDates}
                setShowAllDates={setShowAllDates}
                clientId={clientId}
                isPepsiMen={isPepsiMen}
              />
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-6">
              <ClientInsights 
                suggestions={[]} 
                client={client}
                operations={clientOperations}
              />
            </TabsContent>
            
            <TabsContent value="public-preview" className="space-y-6">
              <ClientPublicPreview 
                client={client} 
                operations={clientOperations} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
