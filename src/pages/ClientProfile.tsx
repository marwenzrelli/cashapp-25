
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientProfileHeader } from "@/features/clients/components/ClientProfileHeader";
import { ClientInfoCards } from "@/features/clients/components/ClientInfoCards";
import { ClientProfileTabs } from "@/features/clients/components/ClientProfileTabs";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

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
    isPepsiMen,
    updateOperation
  } = useClientProfile();
  const navigateToClients = () => navigate("/clients");

  // Process the error to ensure it's either null or an Error object
  const processedError = error ? (typeof error === 'string' ? new Error(error) : error as Error) : null;

  return (
    <div className="flex justify-center w-full">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl w-full">
        <ClientProfileHeader 
          client={client} 
          clientId={clientId} 
          clientBalance={clientBalance} 
          isLoading={isLoading} 
          formatAmount={formatAmount} 
          refreshClientBalance={refreshClientBalance} 
          navigateToClients={navigateToClients} 
          error={processedError} 
        />

        {client && !isLoading && !error && (
          <div className="space-y-6">
            <ClientInfoCards 
              client={client} 
              clientId={clientId} 
              clientOperations={clientOperations} 
              exportToExcel={exportToExcel} 
              exportToPDF={exportToPDF} 
              formatAmount={formatAmount} 
            />

            <ClientProfileTabs 
              client={client} 
              clientId={clientId} 
              clientOperations={clientOperations} 
              filteredOperations={filteredOperations} 
              selectedType={selectedType} 
              setSelectedType={setSelectedType} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              dateRange={dateRange} 
              setDateRange={setDateRange} 
              isCustomRange={isCustomRange} 
              setIsCustomRange={setIsCustomRange} 
              showAllDates={showAllDates} 
              setShowAllDates={setShowAllDates} 
              refreshClientOperations={refreshClientOperations} 
              isPepsiMen={isPepsiMen}
              updateOperation={updateOperation}
            />
          </div>
        )}
        
        <ScrollToTop />
      </div>
    </div>
  );
}
