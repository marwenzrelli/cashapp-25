
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientProfileHeader } from "@/features/clients/components/ClientProfileHeader";
import { ClientInfoCards } from "@/features/clients/components/ClientInfoCards";
import { ClientProfileTabs } from "@/features/clients/components/ClientProfileTabs";

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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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
      
      {/* Hidden buttons to trigger dialogs */}
      <div className="hidden">
        <button id="depositDialog" onClick={() => document.querySelector<HTMLElement>('[data-deposit-dialog-trigger]')?.click()}>Open Deposit</button>
        <button id="withdrawalDialog" onClick={() => document.querySelector<HTMLElement>('[data-withdrawal-dialog-trigger]')?.click()}>Open Withdrawal</button>
        <button id="exportExcel" onClick={exportToExcel}>Export to Excel</button>
        <button id="exportPDF" onClick={exportToPDF}>Export to PDF</button>
      </div>
    </div>
  );
}
